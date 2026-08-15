Feature: Booking form
  As a client, I want to send a booking request through the site so Lígia can
  confirm availability (index.html + js/index/booking-form.js).

  Background:
    Given I open the booking form

  Scenario: Sending without a start date is rejected
    When I click "Send booking request" without filling in any dates
    Then I see an alert asking for the start date
    And the booking is not marked as sent

  Scenario: Sending without an address is rejected
    Given I fill in the first day as "2025-08-10"
    When I click "Send booking request" without filling in an address
    Then I see an alert asking for the address
    And the booking is not marked as sent

  Scenario: Sending without a name is rejected
    Given I fill in the first day as "2025-08-10"
    And I fill in the address as "Kerkstraat 1, 's-Hertogenbosch"
    When I click "Send booking request" without filling in a name
    Then I see an alert asking for the name
    And the booking is not marked as sent

  Scenario: Sending without a phone/WhatsApp number is rejected
    Given I fill in the first day as "2025-08-10"
    And I fill in the address as "Kerkstraat 1, 's-Hertogenbosch"
    And I fill in the name as "Jane Doe"
    When I click "Send booking request" without filling in a phone number
    Then I see an alert asking for the phone number
    And the booking is not marked as sent

  Scenario: A complete booking is sent and shows the WhatsApp confirmation
    Given I fill in the first day as "2025-08-10" and the last day as "2025-08-12"
    And I fill in the address as "Kerkstraat 1, 's-Hertogenbosch"
    And I fill in the name as "Jane Doe"
    And I fill in the phone as "+31 6 11111111"
    When I click "Send booking request"
    Then the booking is marked as sent
    And the WhatsApp confirmation link includes the phone number "31699999999"
    And the WhatsApp confirmation link mentions "2025-08-10"

  Scenario: No estimated price is shown before a start date is chosen
    Then the estimated price is not shown

  Scenario: Suggested price for a single cat with one visit a day
    Given I fill in the first day as "2025-08-10" and the last day as "2025-08-12"
    And I add a pet of type "cat"
    And I choose the "morning" visit preference
    Then the suggested price is €45.00

  Scenario: Suggested price for a cat and a dog with two visits a day
    Given I fill in the first day as "2025-08-10" and the last day as "2025-08-11"
    And I add a pet of type "cat"
    And I add a pet of type "dog"
    And I choose the "both" visit preference
    Then the suggested price is €70.00

  Scenario: Suggested price does not include the seasonal surcharge
    Given I fill in the first day as "2025-07-01" and the last day as "2025-07-02"
    And I add a pet of type "cat"
    And I choose the "morning" visit preference
    Then the suggested price is €30.00

  Scenario: Suggested price includes the extra-cat charge for a second cat
    Given I fill in the first day as "2025-08-10" and the last day as "2025-08-12"
    And I add a pet of type "cat"
    And I add a pet of type "cat"
    And I choose the "morning" visit preference
    Then the suggested price is €60.00

  @auth-required
  Scenario: Sending a booking requires logging in first when accounts are enabled
    Given I fill in the first day as "2025-08-10"
    And I fill in the address as "Kerkstraat 1, 's-Hertogenbosch"
    And I fill in the name as "Jane Doe"
    And I fill in the phone as "+31 6 11111111"
    When I click "Send booking request"
    Then I see the login or signup gate instead of a sent confirmation
    And the booking is not marked as sent

  @auth-required
  Scenario: A booking started before email confirmation is resumed and sent automatically (issue #95)
    # Simulates the round trip: client signs up mid-booking, Supabase requires email
    # confirmation (no session yet, so the booking is stashed as "pending"), the client
    # clicks the confirmation link in their email, and lands back on the site already
    # logged in (Supabase's detectSessionInUrl). The booking they started should be sent
    # automatically instead of forcing them to fill in everything again.
    Given a booking is pending confirmation with the first day "2025-08-10" and the last day "2025-08-12"
    When I return to the site already logged in as "jane@example.com" after confirming my email
    Then the booking is marked as sent
    And I see the welcome-back note about the resumed booking
    And the WhatsApp confirmation link mentions "2025-08-10"
