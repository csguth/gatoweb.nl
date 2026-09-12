-- Offline smoke test for the client Profile/Account flow (issue #179 and
-- follow-ups: invite links, claim, RLS, the linked-account email lookup).
--
-- Why this exists: the Playwright/BDD suite never touches a real Postgres
-- instance (it tests pure JS logic or seeded DOM state), so RLS/grant/
-- schema-ordering bugs and pgcrypto-schema issues only ever surfaced after a
-- push, in the PR preview's real Supabase project. This script exercises the
-- exact same RLS policies, grants and RPCs directly, offline, before any
-- push — no git, no CI, no preview needed.
--
-- How to run: paste this whole file into a single SQL execution against a
-- real Supabase Postgres instance that already has supabase/schema.sql
-- applied (e.g. via the Supabase MCP `execute_sql` tool, or `psql`). It is
-- entirely self-contained and self-cleaning: every insert happens inside the
-- implicit transaction of this one statement, and the final `raise
-- exception` — which always fires, on purpose — aborts and rolls back
-- everything it touched (fake clients, fake auth.users rows, the invite,
-- the claim) while surfacing every assertion's result in the error message.
-- A raised exception is the SUCCESS path here: look at the JSON payload,
-- not the fact that an error was raised.
--
-- Every key in the returned JSON should be `true` (or the literal expected
-- value called out in its comment). Any `false`, a stray "NO ERROR RAISED
-- (BUG)", or a Postgres error *before* reaching the final raise means a
-- regression — fix it before pushing schema.sql.
do $$
declare
  v_client_id uuid;
  v_other_client_id uuid;
  v_token text;
  v_preview_name text;
  v_claim_result uuid;
  v_own_count int;
  v_other_count int;
  v_email text;
  v_email_as_client text;
  v_reclaim_error text;
  v_reinvite_error text;
  v_unlink_result boolean;
  v_staff_user_id uuid := '11111111-1111-1111-1111-111111111111';
  v_test_user_id uuid := '22222222-2222-2222-2222-222222222222';
  results jsonb := '{}'::jsonb;
  staff_claims text := '{"email":"gatocatsit@gmail.com","sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  client_claims text;
begin
  client_claims := jsonb_build_object('email', 'schematest-client@example.invalid', 'sub', v_test_user_id::text, 'role', 'authenticated')::text;

  -- Prep (as the superuser connection role): fake staff + linked-account
  -- personas. staff_emails already has 'gatocatsit@gmail.com' seeded by
  -- schema.sql, so no need to insert into it.
  insert into auth.users (id, email) values (v_staff_user_id, 'gatocatsit@gmail.com')
    on conflict (id) do nothing;
  insert into auth.users (id, email) values (v_test_user_id, 'schematest-client@example.invalid')
    on conflict (id) do nothing;

  -- 1) Staff creates two Profiles + an invite for one of them. Exercises the
  --    pgcrypto schema-qualification fix (extensions.gen_random_bytes) and
  --    the staff insert/select policies on clients + client_invites.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', staff_claims, true);
  insert into public.clients (name, pets, preferred_lang) values ('__SCHEMATEST__ target', '[]'::jsonb, 'en') returning id into v_client_id;
  insert into public.clients (name, pets, preferred_lang) values ('__SCHEMATEST__ other', '[]'::jsonb, 'en') returning id into v_other_client_id;
  select public.create_client_invite(v_client_id) into v_token;
  results := results || jsonb_build_object('1_staff_create_invite_ok', v_token is not null and length(v_token) > 10);

  -- 2) Anon can preview a valid invite by name only. Exercises the token
  --    validity check (used_at/expires_at) and the anon grant on the RPC.
  execute 'set local role anon';
  perform set_config('request.jwt.claims', '{}', true);
  select client_name into v_preview_name from public.get_invite_preview(v_token);
  results := results || jsonb_build_object('2_anon_preview_name', v_preview_name); -- expect '__SCHEMATEST__ target'

  -- 3) The invited person claims it. Exercises the `grant select ... to
  --    authenticated` fix on client_invites/account_profile_links (the
  --    "permission denied for table account_profile_links" bug) end to end.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', client_claims, true);
  select public.claim_client_invite(v_token) into v_claim_result;
  results := results || jsonb_build_object('3_claim_result_matches', v_claim_result = v_client_id);

  -- 4/5) The linked account can read its OWN profile, and nothing else.
  --      Exercises the "linked account can select own profile" policy and
  --      its declaration-order fix (it must come after account_profile_links
  --      exists in schema.sql, or the whole file fails to apply with a
  --      42P01 / HTTP 400 on every deploy).
  select count(*) into v_own_count from public.clients where id = v_client_id;
  select count(*) into v_other_count from public.clients where id = v_other_client_id;
  results := results || jsonb_build_object('4_client_sees_own', v_own_count = 1, '5_client_hides_other', v_other_count = 0);

  -- 6) Staff can look up the linked account's real email via the RPC (the
  --    only place it's ever exposed — Profiles never store an email).
  perform set_config('request.jwt.claims', staff_claims, true);
  select public.get_linked_account_email(v_client_id) into v_email;
  results := results || jsonb_build_object('6_staff_gets_email', v_email); -- expect 'schematest-client@example.invalid'

  -- 7) The client themselves (authenticated, but not staff) gets null —
  --    defense in depth even though only staff would ever call this from
  --    the UI.
  perform set_config('request.jwt.claims', client_claims, true);
  select public.get_linked_account_email(v_client_id) into v_email_as_client;
  results := results || jsonb_build_object('7_client_cannot_read_via_rpc', v_email_as_client is null);

  -- 8) Re-claiming the same token must fail (single-use).
  begin
    perform public.claim_client_invite(v_token);
    v_reclaim_error := 'NO ERROR RAISED (BUG)';
  exception when others then
    v_reclaim_error := sqlerrm;
  end;
  results := results || jsonb_build_object('8_reclaim_blocked_message', v_reclaim_error); -- expect 'invite not found or already used'

  -- 9) Staff can't mint a second invite for a Profile that's already
  --    linked (defense in depth — the UI already hides the button).
  perform set_config('request.jwt.claims', staff_claims, true);
  begin
    perform public.create_client_invite(v_client_id);
    v_reinvite_error := 'NO ERROR RAISED (BUG)';
  exception when others then
    v_reinvite_error := sqlerrm;
  end;
  results := results || jsonb_build_object('9_reinvite_blocked_message', v_reinvite_error); -- expect 'client already has a linked account'

  -- 10) Staff unlinks the account: the link disappears, the client can no
  --     longer read the Profile, and a fresh invite can be minted again.
  select public.unlink_client_account(v_client_id) into v_unlink_result;
  results := results || jsonb_build_object('10_unlink_reported_a_link_existed', v_unlink_result);

  perform set_config('request.jwt.claims', client_claims, true);
  select count(*) into v_own_count from public.clients where id = v_client_id;
  results := results || jsonb_build_object('11_client_loses_access_after_unlink', v_own_count = 0);

  perform set_config('request.jwt.claims', staff_claims, true);
  select public.create_client_invite(v_client_id) into v_token;
  results := results || jsonb_build_object('12_can_reinvite_after_unlink', v_token is not null);

  -- 11) Unlinking a Profile with no link at all is reported honestly, not
  --     silently "succeeding".
  select public.unlink_client_account(v_other_client_id) into v_unlink_result;
  results := results || jsonb_build_object('13_unlink_reports_no_link_existed', v_unlink_result = false);

  execute 'reset role';
  raise exception 'SCHEMA_TEST_RESULTS: %', results;
end $$;
