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
