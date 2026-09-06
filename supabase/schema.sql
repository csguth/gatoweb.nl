-- Gato Catsit — bookings & facturen (invoices) schema
-- This file is the single source of truth for the database schema and is applied
-- automatically on every deploy (see .github/actions/apply-db-migration + the deploy
-- workflows), which runs it against the target project via the Supabase Management API.
-- Every statement here MUST stay idempotent (create ... if not exists, alter table ...
-- add column if not exists, create or replace ...) so re-applying it on each deploy is a
-- no-op when nothing changed. You can also still run it by hand in the SQL editor.
--
-- Design (see GitHub issues #5 and #12):
--   * A client must have their own account (email+password, Supabase Auth) to create a
--     booking — see issue #12. Each booking row is tied to its creator via `user_id`.
--   * Two kinds of authenticated users: "staff" (Ligia, listed in `staff_emails`) can see
--     and manage ALL bookings; regular clients can only see their OWN bookings.
--   * Approving a booking (assigning a sequential factuur number) happens through
--     the approve_booking() function so numbering stays atomic and gap-free even
--     if two approvals happened at the same time, and only staff can call it.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id),
  client_email text,
  client_name text,
  client_contact text,
  client_address text,
  date_from date not null,
  date_to date,
  pets jsonb not null default '[]'::jsonb,
  preference text,
  suggested_amount numeric(10,2),
  final_amount numeric(10,2),
  status text not null default 'pending' check (status in ('pending', 'approved', 'cancelled')),
  factuur_number integer unique,
  approved_at timestamptz,
  tikkie_sent boolean not null default false
);

-- Idempotent for existing tables created before issue #12 (production/staging already had
-- this table from issue #5 without these two columns).
alter table public.bookings add column if not exists user_id uuid references auth.users(id);
alter table public.bookings add column if not exists client_email text;

-- Idempotent for existing tables created before issue #32 (professional invoices):
-- client's postal address, required on new bookings (enforced client-side in the booking
-- form) and shown on the invoice as the recipient's address. Nullable at the DB level so
-- older, already-approved bookings aren't broken retroactively.
alter table public.bookings add column if not exists client_address text;

-- Idempotent for existing tables created before issue #52 (invoice integrity fix):
-- the invoice total is no longer a free-typed number — it's always the calculated
-- line-items total (js/facturen/invoice-calc.js) plus an optional, explicit adjustment
-- (with a mandatory reason) recorded here, so the printed invoice and the stored total
-- can never silently drift apart. See approve_booking() below.
alter table public.bookings add column if not exists adjustment_amount numeric(10,2) not null default 0;
alter table public.bookings add column if not exists adjustment_note text;

-- Idempotent for existing tables created before issue #63 (show Tikkie link to client):
-- the actual Tikkie payment URL Lígia sends is now stored here (previously only the
-- `tikkie_sent` boolean existed). Staff write it when marking a booking's Tikkie as sent
-- (js/facturen/facturen-app.js markTikkieSent), and the client sees a "Pay with Tikkie"
-- link for it on their own bookings page (account.html). Nullable, so bookings where no
-- link was saved simply show no payment button. Covered by the existing staff-write /
-- client-read-own RLS policies below (no per-column rules needed).
alter table public.bookings add column if not exists tikkie_url text;

-- Issue #62 follow-up: the official (sequentially-numbered) factuur is now only generated
-- once the Tikkie has actually been PAID. Approving a booking produces a *proforma* instead
-- (status 'approved' with factuur_number still NULL), which doesn't consume a number in the
-- gap-free sequence. paid_at records when staff marked the Tikkie as paid; the real
-- factuur_number is assigned atomically at that moment by mark_booking_paid() below.
alter table public.bookings add column if not exists paid_at timestamptz;

-- Backfill: bookings approved under the OLD flow already have a factuur_number (the invoice
-- was effectively issued at approval time), so treat them as paid to keep them "final"
-- instead of retroactively downgrading them to proforma.
update public.bookings
  set paid_at = coalesce(paid_at, approved_at, now())
  where factuur_number is not null and paid_at is null;

create sequence if not exists public.factuur_number_seq start 1;

-- Staff allow-list: authenticated users who can see/manage ALL bookings (as opposed to a
-- regular client, who only sees their own). Add more rows here if a second staff member
-- ever needs facturen.html access.
create table if not exists public.staff_emails (
  email text primary key
);

insert into public.staff_emails (email) values ('gatocatsit@gmail.com') on conflict do nothing;

alter table public.staff_emails enable row level security;

-- Only staff members can read the allow-list. Writes are admin-only (no client-side
-- insert/update/delete policies). The is_staff() function below uses security definer
-- so it reads this table as its owner, bypassing RLS — enabling RLS here does not
-- break the function.
drop policy if exists "staff can select staff_emails" on public.staff_emails;
create policy "staff can select staff_emails"
  on public.staff_emails for select
  to authenticated
  using (public.is_staff());

revoke all on public.staff_emails from anon;
grant select on public.staff_emails to authenticated;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_emails where email = auth.jwt() ->> 'email'
  );
$$;

-- Lock down execution: only authenticated users may call is_staff(). We revoke from
-- `anon` explicitly (not just PUBLIC) so the Supabase security advisor's
-- "anon can execute SECURITY DEFINER function" lint stays clear.
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

alter table public.bookings enable row level security;

-- Booking a visit now requires a client account (issue #12): only an authenticated user
-- can insert, and only as their own booking (user_id must match their own auth uid).
-- Also blocks clients from setting financial columns on insert (issue #58): final_amount
-- must stay null and adjustment_amount at its zero default until staff runs
-- approve_booking(), which is the only place those columns should be written.
drop policy if exists "public can insert pending bookings" on public.bookings;
drop policy if exists "clients can insert own pending bookings" on public.bookings;
create policy "clients can insert own pending bookings"
  on public.bookings for insert
  to authenticated
  with check (
    status = 'pending'
    and factuur_number is null
    and user_id = auth.uid()
    and final_amount is null
    and adjustment_amount = 0
  );

-- Staff (Ligia) can see every booking; a client can only see their own.
drop policy if exists "authenticated can select bookings" on public.bookings;
drop policy if exists "staff can select all bookings" on public.bookings;
create policy "staff can select all bookings"
  on public.bookings for select
  to authenticated
  using (public.is_staff());

drop policy if exists "clients can select own bookings" on public.bookings;
create policy "clients can select own bookings"
  on public.bookings for select
  to authenticated
  using (user_id = auth.uid());

-- Only staff can edit bookings (approve, mark Tikkie sent, etc.) — a client's own
-- booking is otherwise read-only to them.
drop policy if exists "authenticated can update bookings" on public.bookings;
drop policy if exists "staff can update bookings" on public.bookings;
create policy "staff can update bookings"
  on public.bookings for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

revoke insert on public.bookings from anon;
grant select, insert, update on public.bookings to authenticated;
grant usage, select on sequence public.factuur_number_seq to authenticated;

-- Atomically approve a pending booking: locks in the final amount and moves it to
-- 'approved'. As of issue #62 this NO LONGER assigns a factuur_number — approval only
-- produces a proforma (factuur_number stays NULL). The real, sequential number is handed
-- out later by mark_booking_paid() once the Tikkie is paid, so the numbering sequence has
-- no gaps for bookings that are approved but never paid. Only callable by staff.
--
-- Issue #52: the final amount is no longer an arbitrary number typed by staff — it's
-- always p_calculated_total (the sum of the invoice line items, computed client-side by
-- js/facturen/invoice-calc.js from the booking's actual dates/pets/preference) plus an
-- optional, explicit p_adjustment_amount. A non-zero adjustment REQUIRES a reason
-- (p_adjustment_note), so any deviation from the calculated total is always visible and
-- explained on the stored booking / printed invoice, instead of silently overwriting the
-- total with an unrelated number.
drop function if exists public.approve_booking(uuid, numeric);

create or replace function public.approve_booking(
  p_booking_id uuid,
  p_calculated_total numeric,
  p_adjustment_amount numeric default 0,
  p_adjustment_note text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.bookings;
begin
  if not public.is_staff() then
    raise exception 'not authorized';
  end if;

  if coalesce(p_adjustment_amount, 0) <> 0 and (p_adjustment_note is null or btrim(p_adjustment_note) = '') then
    raise exception 'adjustment_note is required when adjustment_amount is non-zero';
  end if;

  update public.bookings
    set status = 'approved',
        final_amount = round(coalesce(p_calculated_total, 0) + coalesce(p_adjustment_amount, 0), 2),
        adjustment_amount = coalesce(p_adjustment_amount, 0),
        adjustment_note = nullif(btrim(coalesce(p_adjustment_note, '')), ''),
        approved_at = now()
    where id = p_booking_id and status = 'pending'
    returning * into v_row;

  if v_row.id is null then
    raise exception 'booking not found or already processed';
  end if;

  return v_row;
end;
$$;

revoke all on function public.approve_booking(uuid, numeric, numeric, text) from public, anon;
grant execute on function public.approve_booking(uuid, numeric, numeric, text) to authenticated;

-- Issue #62: mark an approved booking's Tikkie as PAID. This is the moment the official
-- factuur comes into existence: it assigns the next sequential factuur_number (only if the
-- booking doesn't already have one, so re-marking is idempotent and never burns a number)
-- and stamps paid_at. Marking as paid also implies the Tikkie was sent. Staff only.
--
-- SELECT ... FOR UPDATE locks the row first so two concurrent calls can't both pull a fresh
-- nextval for the same booking; the coalesce keeps an already-issued number stable.
create or replace function public.mark_booking_paid(
  p_booking_id uuid
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.bookings;
  v_number integer;
begin
  if not public.is_staff() then
    raise exception 'not authorized';
  end if;

  select factuur_number into v_number
    from public.bookings
    where id = p_booking_id and status = 'approved'
    for update;

  if not found then
    raise exception 'booking not found or not approved';
  end if;

  if v_number is null then
    v_number := nextval('public.factuur_number_seq');
  end if;

  update public.bookings
    set factuur_number = v_number,
        tikkie_sent = true,
        paid_at = coalesce(paid_at, now())
    where id = p_booking_id
    returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.mark_booking_paid(uuid) from public, anon;
grant execute on function public.mark_booking_paid(uuid) to authenticated;

-- Issue #52: client name/phone/address are normally read-only in facturen.html once a
-- booking exists — they come from the client's own booking submission. When staff really
-- need to correct a mistake (typo, outdated phone number, etc.) they go through this
-- separate, audited RPC instead of a free-text field in the approval flow, so every
-- correction has a reason and a paper trail (booking_client_edits).
create table if not exists public.booking_client_edits (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  edited_by uuid references auth.users(id),
  edited_at timestamptz not null default now(),
  reason text not null,
  old_client_name text,
  new_client_name text,
  old_client_contact text,
  new_client_contact text,
  old_client_address text,
  new_client_address text
);

alter table public.booking_client_edits enable row level security;

drop policy if exists "staff can select client edits" on public.booking_client_edits;
create policy "staff can select client edits"
  on public.booking_client_edits for select
  to authenticated
  using (public.is_staff());

drop policy if exists "staff can insert client edits" on public.booking_client_edits;
create policy "staff can insert client edits"
  on public.booking_client_edits for insert
  to authenticated
  with check (public.is_staff());

grant select, insert on public.booking_client_edits to authenticated;

create or replace function public.edit_client_info(
  p_booking_id uuid,
  p_new_client_name text,
  p_new_client_contact text,
  p_new_client_address text,
  p_reason text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.bookings;
  v_row public.bookings;
begin
  if not public.is_staff() then
    raise exception 'not authorized';
  end if;

  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'reason is required to edit client info';
  end if;

  select * into v_old from public.bookings where id = p_booking_id;
  if v_old.id is null then
    raise exception 'booking not found';
  end if;

  update public.bookings
    set client_name = p_new_client_name,
        client_contact = p_new_client_contact,
        client_address = p_new_client_address
    where id = p_booking_id
    returning * into v_row;

  insert into public.booking_client_edits (
    booking_id, edited_by, reason,
    old_client_name, new_client_name,
    old_client_contact, new_client_contact,
    old_client_address, new_client_address
  ) values (
    p_booking_id, auth.uid(), btrim(p_reason),
    v_old.client_name, p_new_client_name,
    v_old.client_contact, p_new_client_contact,
    v_old.client_address, p_new_client_address
  );

  return v_row;
end;
$$;

revoke all on function public.edit_client_info(uuid, text, text, text, text) from public, anon;
grant execute on function public.edit_client_info(uuid, text, text, text, text) to authenticated;

-- Manual step after running this file:
--   Authentication > Users > Add user — create Ligia's login (email + password), and make
--   sure her email is in the `staff_emails` table above (already inserted by this script).
--   Only staff can open /facturen.html and see every booking; regular clients created
--   through /account.html or the booking form on / only ever see their own (RLS above).

-- ─────────────────────────────────────────────────────────────────────────
-- Google Calendar sync (issues #6, #160)
--
-- The Google Calendar is kept as a live projection of `bookings`, one event
-- PER VISIT (a "both" day gets two events — one for the morning visit, one
-- for the evening visit — not one event spanning the whole day, and not one
-- event spanning the whole booking) so each visit can be moved/edited
-- independently in Calendar: events are created once a booking is approved,
-- updated in place (same event id) when a visit's content changes, new
-- visits get new events, removed visits get their events deleted, and every
-- visit's event is removed once the booking is no longer approved (e.g.
-- cancelled) or its row is deleted. This trigger intentionally does NOT
-- decide any of that itself — it just forwards every INSERT/UPDATE/DELETE of
-- a calendar-relevant field to the gcal-sync Edge Function, whose
-- `decideSyncAction()`/`planDailySync()` (see
-- supabase/functions/gcal-sync/logic.js, covered by
-- tests/bdd/features/gcal-sync-*.feature) are the single source of truth for
-- what actually happens. Reminders come for free from the Google Calendar app
-- (default notifications on the calendar), so no bespoke reminder system is
-- built here.
-- ─────────────────────────────────────────────────────────────────────────

create extension if not exists pg_net;

-- Must drop every trigger that depends on the OLD google_event_id column
-- before dropping that column below (older schema versions created these
-- with `when (old.google_event_id is not null)`).
drop trigger if exists bookings_gcal_sync_insert on public.bookings;
drop trigger if exists bookings_gcal_sync_status_update on public.bookings;
drop trigger if exists bookings_gcal_sync_relevant_update on public.bookings;
drop trigger if exists bookings_gcal_sync_delete on public.bookings;

-- Superseded by google_event_ids below (issue #160 — one event per visit
-- occurrence instead of one event per booking). Safe to drop: no other code
-- reads it.
alter table public.bookings drop column if exists google_event_id;

-- Map of 'YYYY-MM-DD#slot' -> Google Calendar event id, one entry per visit
-- occurrence that currently has an event on the calendar (issue #160) — a
-- "both" preference day has two entries, e.g. '2025-03-10#morning' and
-- '2025-03-10#evening'. Written ONLY by the gcal-sync Edge Function — never
-- set this from the client/app.
alter table public.bookings add column if not exists google_event_ids jsonb not null default '{}'::jsonb;

-- One-time manual step per project (run once in staging, once in production, in the
-- SQL editor) to store the values the trigger below needs without committing them to
-- this file. Use the SAME webhook secret value as the GCAL_WEBHOOK_SECRET Edge
-- Function secret (see `supabase secrets set`).
--   select vault.create_secret('<GCAL_WEBHOOK_SECRET value>', 'gcal_webhook_secret');
--   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1/gcal-sync', 'gcal_sync_url');
-- To rotate a value later, use `select vault.update_secret(...)` instead (create_secret
-- errors if the name already exists).

create or replace function public.notify_gcal_sync()
returns trigger
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  v_url text;
  v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'gcal_sync_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'gcal_webhook_secret';

  -- Vault secrets not configured yet on this project (e.g. local/dev) — skip silently
  -- so bookings keep working even before the Calendar integration is wired up.
  if v_url is null or v_secret is null then
    return coalesce(new, old);
  end if;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-gcal-webhook-secret', v_secret
    ),
    body := jsonb_build_object(
      'type', tg_op,
      -- On DELETE there is no `new` row — `record` is the deleted row itself
      -- (matches the `record`/`old_record` shape decideSyncAction() expects).
      'record', to_jsonb(coalesce(new, old)),
      'old_record', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end
    )
  );

  return coalesce(new, old);
end;
$$;

-- Trigger-only function: nobody calls it directly, so revoke from every client role
-- (it still runs as its definer inside the trigger). This keeps the security advisor
-- lint clear for both anon and authenticated.
revoke all on function public.notify_gcal_sync() from public, anon, authenticated;

-- (Trigger drops already happened above, before dropping the old
-- google_event_id column they depended on.)

-- Fires on every INSERT — decideSyncAction() (logic.js) skips it unless the row
-- was inserted already approved (uncommon, but e.g. imported data).
create trigger bookings_gcal_sync_insert
  after insert on public.bookings
  for each row
  execute function public.notify_gcal_sync();

-- Fires when any field that affects the calendar events' existence or content
-- changes — NOT on every update. This list must cover exactly the same fields
-- decideSyncAction()'s RELEVANT_FIELDS uses (supabase/functions/gcal-sync/logic.js)
-- so the two stay in sync; keep them matched by hand when either changes,
-- since one is SQL and the other is JS. Excluding `google_event_ids` itself
-- from this list also avoids a feedback loop when the Edge Function writes it
-- back onto the row after creating/updating/deleting calendar events.
create trigger bookings_gcal_sync_relevant_update
  after update on public.bookings
  for each row
  when (
    old.status is distinct from new.status or
    old.date_from is distinct from new.date_from or
    old.date_to is distinct from new.date_to or
    old.pets is distinct from new.pets or
    old.preference is distinct from new.preference or
    old.client_name is distinct from new.client_name or
    old.client_email is distinct from new.client_email or
    old.client_contact is distinct from new.client_contact
  )
  execute function public.notify_gcal_sync();

-- Fires on DELETE only when the row actually had calendar events to clean up.
create trigger bookings_gcal_sync_delete
  after delete on public.bookings
  for each row
  when (old.google_event_ids <> '{}'::jsonb)
  execute function public.notify_gcal_sync();

-- ─────────────────────────────────────────────────────────────────────────
-- Keep-alive heartbeat (issue #121, hardened per issue #162)
--
-- Supabase may pause Free Plan projects after ~7 days of low database activity.
-- .github/workflows/keep-alive.yml pings this project daily for both the staging
-- and production projects. This table intentionally holds no meaningful data —
-- it exists ONLY as a safe, non-sensitive ping target. bookings/staff_emails must
-- NOT be used for this: bookings revokes anon access entirely (see above) and
-- staff_emails is being locked down (see "Fix Supabase RLS security
-- vulnerabilities" issue), so pinging either would fail with 401/403 instead of
-- keeping the project active.
--
-- The original version of this ping did a plain `GET .../rest/v1/keepalive`
-- (a SELECT). That kept running successfully (HTTP 200) yet the production
-- project still received a "scheduled to be paused" warning from Supabase, so a
-- read-only ping does not reliably count as activity under Supabase's
-- (undocumented, discretionary) low-activity heuristic. ping_keepalive() below
-- performs a real UPDATE instead — a write, which every keep-alive approach
-- observed in the wild (e.g. github.com/ongwu/supabase-keepalive,
-- github.com/AbanoupRefat/supabase-keepalive) relies on instead of a read.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.keepalive (
  id int primary key generated always as identity,
  pinged_at timestamptz not null default now()
);

insert into public.keepalive (pinged_at)
  select now()
  where not exists (select 1 from public.keepalive);

alter table public.keepalive enable row level security;

-- No direct table access for anon anymore — writes only happen through
-- ping_keepalive() below, which is the least-privilege way to allow a write
-- without exposing INSERT/UPDATE/DELETE on the table itself.
revoke all on public.keepalive from anon;
drop policy if exists "anon can select keepalive" on public.keepalive;

-- security definer so the anon-callable RPC can UPDATE the row despite RLS
-- and no direct grants on the table. This is an intentional, narrow exception
-- to the "anon can execute SECURITY DEFINER function" security-advisor lint:
-- the function only touches this non-sensitive heartbeat table.
--
-- `where id is not null` is required, not decorative: Supabase's Postgres
-- images ship the pg_safeupdate extension, which rejects any UPDATE/DELETE
-- lacking a WHERE clause with error 21000 ("UPDATE requires a WHERE clause"),
-- even from inside a SECURITY DEFINER function. `id` is the primary key, so
-- this still updates every row in the (single-row) table, matching the
-- original unconditional UPDATE's behaviour.
create or replace function public.ping_keepalive()
returns void
language sql
security definer
set search_path = public
as $$
  update public.keepalive set pinged_at = now() where id is not null;
$$;

revoke all on function public.ping_keepalive() from public;
grant execute on function public.ping_keepalive() to anon;

-- ─────────────────────────────────────────────────────────────────────────
-- Client roster + invite-by-link sign-up (issue #173)
--
-- Lígia already knows the name/phone/address of her existing clients (from
-- WhatsApp, word of mouth, etc.) before they ever create an account or place
-- a booking through the site. This table lets her pre-register that info, one
-- client at a time, from the facturen dashboard (js/facturen/facturen-app.js).
-- After saving a row here, she generates a native Supabase invite link for
-- that email (supabase/functions/client-invite, using auth.admin.generateLink
-- with type 'invite' — no email is sent automatically) and pastes it into
-- WhatsApp herself. There is deliberately NO custom token/expiry table here:
-- Supabase's own invite link already carries a secure, single-use, expiring
-- token, and clicking it logs the client straight into /account/ (which
-- already has `detectSessionInUrl: true`).
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  name text not null,
  email text not null unique,
  phone text,
  address text,
  -- Which of the site's three languages the invite link/redirect should use
  -- (/en/account/, /nl/account/ or /pt/account/) — Lígia picks it when she
  -- registers the client, since she already knows which language they speak.
  preferred_lang text not null default 'en' check (preferred_lang in ('en', 'nl', 'pt')),
  user_id uuid references auth.users(id),
  invited_at timestamptz,
  accepted_at timestamptz
);

alter table public.clients enable row level security;

-- Only staff manage the roster — clients never query this table directly
-- (they interact only via their invite link and, once linked, their own
-- bookings).
drop policy if exists "staff can select clients" on public.clients;
create policy "staff can select clients"
  on public.clients for select
  to authenticated
  using (public.is_staff());

drop policy if exists "staff can insert clients" on public.clients;
create policy "staff can insert clients"
  on public.clients for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists "staff can update clients" on public.clients;
create policy "staff can update clients"
  on public.clients for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

revoke all on public.clients from anon;
grant select, insert, update on public.clients to authenticated;

-- Called once by a client right after they land back from their invite link
-- and set a password (static/js/account/account-app.js). Marks their roster
-- row as accepted and links any pre-existing bookings that already carry
-- their client_email but no user_id (e.g. legacy/manually-entered rows) to
-- their new auth user, so nothing they already had gets orphaned. SECURITY
-- DEFINER because writing another row's user_id would otherwise be blocked by
-- the "staff can update bookings"/"staff can update clients" policies — this
-- function deliberately only ever touches rows matching the CALLER's own
-- verified email (auth.jwt() ->> 'email'), never an arbitrary row.
create or replace function public.link_my_bookings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := auth.jwt() ->> 'email';
  v_count integer;
begin
  if v_email is null then
    raise exception 'not authenticated';
  end if;

  update public.clients
    set user_id = auth.uid(),
        accepted_at = coalesce(accepted_at, now())
    where email = v_email and user_id is null;

  update public.bookings
    set user_id = auth.uid()
    where client_email = v_email and user_id is null;

  get diagnostics v_count = row_count;

  return v_count;
end;
$$;

revoke all on function public.link_my_bookings() from public, anon;
grant execute on function public.link_my_bookings() to authenticated;
