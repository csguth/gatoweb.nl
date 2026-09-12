Feature: Deciding whether to auto-claim an invite token (issue #180 bug fix)
  account-app.js used to claim whichever invite token was in the URL against
  whatever session already existed the moment the page loaded — including a
  session that had nothing to do with the invite (e.g. Lígia testing on a
  shared browser, or a client who is already logged in as themselves and
  opens a stale/forwarded invite link meant for someone else). That silently
  linked the wrong Account to the wrong Profile with no warning. The pure
  decision now lives in js/account/invite-intake.js: a session that was
  already there before the client did anything on this page (a "restored"
  session) blocks the automatic claim; a session obtained by actually
  logging in or signing up on the invite page itself is always trusted,
  since that's a deliberate action taken right here.

  Scenario: No invite token — always a no-op regardless of session state
    Given there is no invite token
    And no session exists yet
    When the invite intake decision is made
    Then the decision is "no_invite"

  Scenario: An invite token with no pre-existing session claims normally (happy path)
    Given an invite token is present
    And no session exists yet
    When the invite intake decision is made
    Then the decision is "ready_to_claim"

  Scenario: An invite token opened while already logged in from before is blocked
    Given an invite token is present
    And a session was already restored when the page loaded
    When the invite intake decision is made
    Then the decision is "blocked_existing_session"

  Scenario: Logging in or signing up on the invite page itself is always trusted
    Given an invite token is present
    And the client just logged in or signed up on this very page
    When the invite intake decision is made
    Then the decision is "ready_to_claim"

  Scenario: Logging out first turns a previously-restored session back into a fresh one
    Given an invite token is present
    And a session was already restored when the page loaded
    But the client explicitly logged out since then
    And the client just logged in or signed up on this very page
    When the invite intake decision is made
    Then the decision is "ready_to_claim"
