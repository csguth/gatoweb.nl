// Pure decision logic for account-app.js's invite-claiming flow (issue #180
// follow-up). No DOM/Alpine/Supabase here — see tests/bdd/features/invite-intake.feature.
//
// The bug this fixes: account-app.js used to claim whatever invite token was
// in the URL against whatever session already existed the moment the page
// loaded, with no distinction between "I'm logging in/signing up right now
// to accept this invite" (safe) and "I already had a session open before I
// ever touched this page, and it just happens to have an invite token in the
// URL" (unsafe — could silently link the wrong Account to the wrong Profile).
//
// decideInviteIntake() only answers "should account-app.js call
// claim_client_invite() right now?". It never talks to Supabase itself.
export function decideInviteIntake({
  hasInviteToken,
  sessionAlreadyExistedAtLoad,
  loggedOutSinceLoad = false,
  justAuthenticatedOnThisPage = false
}) {
  if (!hasInviteToken) return 'no_invite';

  // A deliberate login/signup performed on the invite page itself is always
  // trusted, even if a different session existed before — logging out first
  // (tracked via loggedOutSinceLoad) makes that explicit, but the freshly
  // established session from an explicit auth action is the source of truth
  // either way.
  if (justAuthenticatedOnThisPage) return 'ready_to_claim';

  if (sessionAlreadyExistedAtLoad && !loggedOutSinceLoad) return 'blocked_existing_session';

  return 'ready_to_claim';
}
