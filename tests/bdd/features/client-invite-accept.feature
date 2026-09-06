Feature: Client sets a password after following an invite link (issue #173, MVP)
  When a client lands on /account/ via Lígia's invite link, Supabase's redirect
  fragment includes `type=invite` and they're already authenticated — but must
  set a password before seeing their bookings. See js/account/account-app.js
  init()/setPassword() and layouts/account/list.html.

  @auth-required
  Scenario: An invited client is prompted to set a password instead of seeing bookings
    Given I am logged in on my bookings page via an invite link
    Then I see the "Welcome! Set your password" prompt
    And I do not see "No bookings yet."

  @auth-required
  Scenario: Setting a password reveals the bookings list
    Given I am logged in on my bookings page via an invite link
    When I finish setting my password
    Then I see "No bookings yet."
    And I do not see the "Welcome! Set your password" prompt

  @auth-required
  Scenario: Linked previous bookings are announced
    Given I am logged in on my bookings page via an invite link
    When I finish setting my password and 2 previous bookings are linked
    Then I see a message that 2 previous bookings were linked
