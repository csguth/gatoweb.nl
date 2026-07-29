Feature: Pay with Tikkie link on the client bookings page
  A client on their "My bookings" page (account.html) should see a
  "Pay with Tikkie" button on an approved booking that has a stored Tikkie
  link, and no payment button when there is none — so no broken link ever
  shows (issue #63).

  @auth-required
  Scenario: Approved booking with a Tikkie link shows a Pay with Tikkie button
    Given I am logged in on my bookings page
    When my bookings include an approved booking with the Tikkie link "https://tikkie.me/pay/abc123"
    Then I see a Pay with Tikkie button linking to "https://tikkie.me/pay/abc123"

  @auth-required
  Scenario: Approved booking without a Tikkie link shows no payment button
    Given I am logged in on my bookings page
    When my bookings include an approved booking with no Tikkie link
    Then I do not see a Pay with Tikkie button

  @auth-required
  Scenario: A still-pending booking never shows a Pay with Tikkie button
    Given I am logged in on my bookings page
    When my bookings include a pending booking with the Tikkie link "https://tikkie.me/pay/abc123"
    Then I do not see a Pay with Tikkie button

  @auth-required
  Scenario: A paid booking does not show a Pay with Tikkie button anymore
    Given I am logged in on my bookings page
    When my bookings include a paid booking with the Tikkie link "https://tikkie.me/pay/abc123"
    Then I do not see a Pay with Tikkie button
