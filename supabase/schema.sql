-- Gato Petsit — bookings & facturen (invoices) schema
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

create sequence if not exists public.factuur_number_seq start 1;

-- Staff allow-list: authenticated users who can see/manage ALL bookings (as opposed to a
-- regular client, who only sees their own). Add more rows here if a second staff member
-- ever needs facturen.html access.
create table if not exists public.staff_emails (
  email text primary key
);

insert into public.staff_emails (email) values ('gatocatsit@gmail.com') on conflict do nothing;

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

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

alter table public.bookings enable row level security;

-- Booking a visit now requires a client account (issue #12): only an authenticated user
-- can insert, and only as their own booking (user_id must match their own auth uid).
drop policy if exists "public can insert pending bookings" on public.bookings;
drop policy if exists "clients can insert own pending bookings" on public.bookings;
create policy "clients can insert own pending bookings"
  on public.bookings for insert
  to authenticated
  with check (status = 'pending' and factuur_number is null and user_id = auth.uid());

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

-- Atomically approve a pending booking: assigns the next sequential factuur number and
-- locks in the final amount. Only callable by staff.
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
        factuur_number = nextval('public.factuur_number_seq'),
        approved_at = now()
    where id = p_booking_id and status = 'pending'
    returning * into v_row;

  if v_row.id is null then
    raise exception 'booking not found or already processed';
  end if;

  return v_row;
end;
$$;

revoke all on function public.approve_booking(uuid, numeric, numeric, text) from public;
grant execute on function public.approve_booking(uuid, numeric, numeric, text) to authenticated;

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

revoke all on function public.edit_client_info(uuid, text, text, text, text) from public;
grant execute on function public.edit_client_info(uuid, text, text, text, text) to authenticated;

-- Manual step after running this file:
--   Authentication > Users > Add user — create Ligia's login (email + password), and make
--   sure her email is in the `staff_emails` table above (already inserted by this script).
--   Only staff can open /facturen.html and see every booking; regular clients created
--   through /account.html or the booking form on / only ever see their own (RLS above).

-- ─────────────────────────────────────────────────────────────────────────
-- Google Calendar sync (issue #6)
--
-- Bookings only get pushed to the gcal-sync Edge Function when the admin
-- approves them — pending bookings are not put on the calendar, since they
-- may never be approved. Reminders come for free from the Google Calendar
-- app (default notifications on the calendar), so no bespoke reminder
-- system is built here.
-- ─────────────────────────────────────────────────────────────────────────

create extension if not exists pg_net;

alter table public.bookings add column if not exists google_event_id text;

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
      'record', to_jsonb(new),
      'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) else null end
    )
  );

  return coalesce(new, old);
end;
$$;

revoke all on function public.notify_gcal_sync() from public;

-- Fires only when status actually changes (e.g. pending -> approved), not on every
-- update — this also avoids a loop when the Edge Function writes google_event_id
-- back onto the row, since that update doesn't touch `status`. The Edge Function
-- itself decides whether the new status warrants creating a calendar event
-- (currently: only "approved").
drop trigger if exists bookings_gcal_sync_insert on public.bookings;
drop trigger if exists bookings_gcal_sync_status_update on public.bookings;
create trigger bookings_gcal_sync_status_update
  after update on public.bookings
  for each row
  when (old.status is distinct from new.status)
  execute function public.notify_gcal_sync();
