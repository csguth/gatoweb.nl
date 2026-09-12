Feature: Consistent DD/MM/YYYY date display (issue #78)
  Booking date ranges on the client's account.html bookings page are rendered
  as DD/MM/YYYY through the shared js/shared/format-date.js helper. See
  format-date.feature for the pure formatDateDDMMYYYY unit scenarios.

  @auth-required
  Scenario: Booking date range on the client's bookings page uses DD/MM/YYYY
    Given I am logged in on my bookings page
    When my bookings include a booking from "2025-08-01" to "2025-08-03"
    Then I see the booking dates "01/08/2025 → 03/08/2025"

