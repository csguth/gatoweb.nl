-- Gato Petsit — bookings & facturen (invoices) schema
-- Run this once in the Supabase project's SQL editor (Database > SQL Editor).
--
-- Design (see GitHub issue #5):
--   * Anyone (anon, the public booking form) can INSERT a new pending booking.
--   * Only an authenticated user (Ligia, via Supabase Auth) can list/update bookings.
--   * Approving a booking (assigning a sequential factuur number) happens through
--     the approve_booking() function so numbering stays atomic and gap-free even
--     if two approvals happened at the same time.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
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
  approved_at timestamptz
);

create sequence if not exists public.factuur_number_seq start 1;

alter table public.bookings enable row level security;

-- The public site can only ever create new, unnumbered, pending bookings.
drop policy if exists "public can insert pending bookings" on public.bookings;
create policy "public can insert pending bookings"
  on public.bookings for insert
  to anon
  with check (status = 'pending' and factuur_number is null);

-- Only Ligia (logged in via Supabase Auth) can see or edit bookings.
drop policy if exists "authenticated can select bookings" on public.bookings;
create policy "authenticated can select bookings"
  on public.bookings for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update bookings" on public.bookings;
create policy "authenticated can update bookings"
  on public.bookings for update
  to authenticated
  using (true)
  with check (true);

grant insert on public.bookings to anon;
grant select, insert, update on public.bookings to authenticated;
grant usage, select on sequence public.factuur_number_seq to authenticated;

-- Atomically approve a pending booking: assigns the next sequential factuur
-- number and locks in the final amount. Only callable by an authenticated user.
create or replace function public.approve_booking(p_booking_id uuid, p_final_amount numeric)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.bookings;
begin
  if auth.role() <> 'authenticated' then
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
--   Authentication > Users > Add user — create Ligia's login (email + password).
--   Only that user will be able to open /facturen.html (RLS requires "authenticated").
