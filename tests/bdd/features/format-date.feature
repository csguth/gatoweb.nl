Feature: Consistent DD/MM/YYYY date formatting (issue #78)
  formatDateDDMMYYYY (static/js/shared/format-date.js) is the shared helper
  behind every date shown to a client or to staff — booking date ranges on
  account.html/facturen.html, the invoice date and its line-item date ranges
  (js/shared/invoice-document.js), and the WhatsApp confirmation message —
  instead of a raw ISO string ('YYYY-MM-DD') or a locale-dependent format
  (e.g. `toLocaleDateString('nl-NL')`, which drops leading zeros). See
  date-format.feature for the UI scenario that exercises it on a real page.

  Scenario Outline: formatDateDDMMYYYY renders dates as DD/MM/YYYY
    When I format the date "<input>"
    Then the formatted date is "<expected>"

    Examples:
      | input                | expected   |
      | 2025-08-01           | 01/08/2025 |
      | 2025-01-05           | 05/01/2025 |
      | 2025-03-10T09:00:00Z | 10/03/2025 |
