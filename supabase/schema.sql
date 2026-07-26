-- Gato Petsit — bookings & facturen (invoices) schema
-- Run this once in the Supabase project's SQL editor (Database > SQL Editor).
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

-- Atomically approve a pending booking: assigns the next sequential factuur
-- number and locks in the final amount. Only callable by staff.
create or replace function public.approve_booking(p_booking_id uuid, p_final_amount numeric)
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

  update public.bookings
    set status = 'approved',
        final_amount = p_final_amount,
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

revoke all on function public.approve_booking(uuid, numeric) from public;
grant execute on function public.approve_booking(uuid, numeric) to authenticated;

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
