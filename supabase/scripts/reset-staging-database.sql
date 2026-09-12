-- Resets the STAGING Supabase project's data to a clean slate, keeping only
-- the `staging-test@gatocatsit.dev` staff account (auth.users + staff_emails).
-- Everything else — every client Profile, invite, account/profile link,
-- booking, booking edit history and other staff accounts/emails — is wiped.
--
-- ⚠️  NEVER run this against the production project (`gato-catsit`). It is
-- meant EXCLUSIVELY for `gato-catsit-staging`, to give Lígia (and this repo's
-- own preview/testing flow) a clean, predictable starting point on demand.
--
-- Safety: the very first thing this script does is verify that
-- `staging-test@gatocatsit.dev` already exists in auth.users. That account is
-- staging-only (it's never created on production), so if it's missing this
-- aborts immediately with an exception instead of touching any data — the
-- strongest guard a plain SQL script can offer without out-of-band knowledge
-- of which project it is connected to. Do not remove or weaken this check.
--
-- How to run:
--   * Preferred: trigger the "Reset staging database" GitHub Actions workflow
--     (workflow_dispatch only, always targets the `staging` environment/project;
--     see .github/workflows/reset-staging-database.yml) and type the required
--     confirmation phrase.
--   * Manually: paste this whole file into the Supabase SQL editor (or run it
--     via `psql`/the Management API) while connected to gato-catsit-staging.
--
-- This is intentionally NOT part of supabase/schema.sql (which only ever
-- contains idempotent, additive statements applied on every deploy) — it is a
-- deliberate, manually-triggered, destructive operation.
do $$
declare
  keep_email text := 'staging-test@gatocatsit.dev';
  keep_user_id uuid;
begin
  select id into keep_user_id from auth.users where email = keep_email;

  if keep_user_id is null then
    raise exception
      'Refusing to run: % was not found in auth.users. This does not look like the staging project — aborting without changing anything.',
      keep_email;
  end if;

  -- Delete business data in FK-safe order (children before parents). Deleting
  -- public.bookings cascades to public.booking_client_edits (on delete cascade
  -- in schema.sql), so that table needs no explicit delete here.
  delete from public.account_profile_links;
  delete from public.client_invites;
  delete from public.bookings;
  delete from public.clients;

  -- Staff allow-list: keep only the account we're keeping.
  delete from public.staff_emails where email <> keep_email;
  insert into public.staff_emails (email) values (keep_email) on conflict do nothing;

  -- Every other Auth account is removed. Supabase's own auth schema cascades
  -- from auth.users to auth.identities/auth.sessions/auth.refresh_tokens etc.,
  -- and every public-schema FK into auth.users (clients.created_by,
  -- client_invites.created_by, bookings.user_id, booking_client_edits.edited_by)
  -- has already been emptied above, so this cannot fail on a stray reference.
  delete from auth.users where id <> keep_user_id;

  -- Full reset: the next approved booking should get factuur number 1 again.
  alter sequence public.factuur_number_seq restart with 1;

  raise notice 'Staging database reset complete. Kept only %.', keep_email;
end $$;
