Feature: Invoice document — proforma vs final factuur
  The same generator (js/shared/invoice-document.js) produces both the proforma
  preview shown before payment and the official numbered factuur issued once the
  Tikkie is paid (issue #62). Until a booking has a factuur_number it is a
  proforma (no official number, with a non-fiscal notice); once paid it becomes
  the numbered factuur. The document is always rendered in Dutch.

  Background:
    Given the Dutch invoice translations and business config are loaded

  Scenario: A booking without a factuur number renders a proforma
    Given a booking from "2025-03-10" to "2025-03-12" for a cat with "morning" preference
    When the invoice document is built
    Then the document title is "Proforma factuur"
    And the document shows the proforma notice
    And the document total is €45.00

  Scenario: A paid booking renders the official numbered factuur
    Given a booking from "2025-03-10" to "2025-03-12" for a cat with "morning" preference
    And the booking is paid as factuur number 7 on "2025-03-01"
    When the invoice document is built
    Then the document title is "Factuur 2025-0007"
    And the document does not show the proforma notice
    And the document total is €45.00
