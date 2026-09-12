Feature: Client signs up via an invite link and sees their Profile (issue #179)
  Unlike the old flow (issue #173, MVP), a client landing on
  /invite/?invite=<token> is NOT already authenticated — the token carries no
  email. They're greeted by name (get_invite_preview() RPC) and sign up with
  their own email + password like any other client, then
  claim_client_invite() links their new Account to the pre-registered
  Profile and they see it (name/pets/address, read-only) above their
  bookings. See js/account/account-app.js init()/loadInvitePreview()/
  afterLogin() and layouts/account/list.html (shared with /invite/ via
  content/invite/'s `type: account` front matter, so link previews show an
  invite-specific title).

  @auth-required
  Scenario: A valid invite link greets the client by name before they sign up
    Given I land on my account page via an invite link for "Jane Doe"
    Then I see the "Welcome, Jane Doe!" greeting
    And I do not see "No bookings yet."

  @auth-required
  Scenario: The invite link shows a dedicated create-account form, not a login prompt
    Given I land on my account page via an invite link for "Jane Doe"
    Then I do not see the login-or-signup toggle
    And the submit button reads "Create account"

  @auth-required
  Scenario: An invalid or expired invite link shows an error instead
    Given I land on my account page via an expired invite link
    Then I see the "This invite link is invalid or has expired." message

  @auth-required
  Scenario: Finishing sign-up shows the linked Profile and bookings
    Given I land on my account page via an invite link for "Jane Doe"
    When I finish signing up and my Profile "Jane Doe" with pets "Mimi (cat)" is linked
    Then I see "Jane Doe"
    And I see "Mimi (cat)"
    And I see "No bookings yet."

  @auth-required
  Scenario: Linked previous bookings are announced
    Given I land on my account page via an invite link for "Jane Doe"
    When I finish signing up and 2 previous bookings are linked
    Then I see a message that 2 previous bookings were linked

  @auth-required
  Scenario: The account got created but claiming the invite failed
    Given I land on my account page via an invite link for "Jane Doe"
    When I finish signing up but the invite could not be claimed
    Then I see "Your account was created, but we couldn't link it to your profile automatically. Please contact Lígia so she can help."
