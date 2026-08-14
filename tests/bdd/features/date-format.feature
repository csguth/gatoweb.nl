Feature: Consistent DD/MM/YYYY date display (issue #78)
  Every date shown to a client or to staff — booking date ranges on
  account.html/facturen.html, the invoice date and its line-item date ranges
  (js/shared/invoice-document.js), and the WhatsApp confirmation message — is
  rendered as DD/MM/YYYY through the shared js/shared/format-date.js helper,
  instead of a raw ISO string ('YYYY-MM-DD') or a locale-dependent format
  (e.g. `toLocaleDateString('nl-NL')`, which drops leading zeros).

  Scenario Outline: formatDateDDMMYYYY renders dates as DD/MM/YYYY
    When I format the date "<input>"
    Then the formatted date is "<expected>"

    Examples:
      | input                | expected   |
      | 2025-08-01           | 01/08/2025 |
      | 2025-01-05           | 05/01/2025 |
      | 2025-03-10T09:00:00Z | 10/03/2025 |

  @auth-required
  Scenario: Booking date range on the client's bookings page uses DD/MM/YYYY
    Given I am logged in on my bookings page
    When my bookings include a booking from "2025-08-01" to "2025-08-03"
    Then I see the booking dates "01/08/2025 → 03/08/2025"
