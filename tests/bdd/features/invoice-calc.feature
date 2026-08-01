Feature: Invoice calculation
  As Lígia, invoices must be calculated correctly — including the seasonal
  surcharge split into its own line — so clients are billed the right amount
  (see js/facturen/invoice-calc.js, issue #32).

  Background:
    Given the price rates are one-visit €15, two-visits €25, dog-walk €10, seasonal surcharge 20%

  Scenario: Single cat booking entirely in normal season
    Given a booking from "2025-03-10" to "2025-03-12" for a cat with "morning" preference
    When the invoice line items are calculated
    Then the invoice has 1 line item
    And line item 1 is a "normal" season "service" for "cat" covering 3 days at €15.00 per day
    And the invoice total is €45.00

  Scenario: Booking crossing into high season adds a separate surcharge line
    Given a booking from "2025-06-29" to "2025-07-03" for a cat with "both" preference
    When the invoice line items are calculated
    Then the invoice has 3 line items
    And line item 1 is a "normal" season "service" for "cat" covering 2 days at €25.00 per day
    And line item 2 is a "high" season "service" for "cat" covering 3 days at €25.00 per day
    And line item 3 is a "high" season "surcharge" for "cat" covering 3 days at €5.00 per day
    And the invoice total is €140.00

  Scenario: Booking with both a cat and a dog produces one line item per species
    Given a booking from "2025-03-10" to "2025-03-11" for a cat and a dog with "evening" preference
    When the invoice line items are calculated
    Then the invoice has 2 line items
    And line item 1 is a "normal" season "service" for "cat" covering 2 days at €15.00 per day
    And line item 2 is a "normal" season "service" for "dog" covering 2 days at €10.00 per day
    And the invoice total is €50.00

  Scenario: No seasonal surcharge line is added when the surcharge rate is 0%
    Given the price rates are one-visit €15, two-visits €25, dog-walk €10, seasonal surcharge 0%
    And a booking from "2025-07-01" to "2025-07-02" for a cat with "morning" preference
    When the invoice line items are calculated
    Then the invoice has 1 line item
    And line item 1 is a "high" season "service" for "cat" covering 2 days at €15.00 per day
    And the invoice total is €30.00

  Scenario: A second cat in the same booking adds an extra-cat line item
    Given the price rates are one-visit €15, two-visits €25, dog-walk €10, seasonal surcharge 0%, extra cat €5 per day
    And a booking from "2025-03-10" to "2025-03-12" for 2 cats with "morning" preference
    When the invoice line items are calculated
    Then the invoice has 2 line items
    And line item 1 is a "normal" season "service" for "cat" covering 3 days at €15.00 per day
    And line item 2 is a "normal" season "extra-cat" for "cat" covering 3 days at €5.00 per day
    And the invoice total is €60.00

  Scenario: No extra-cat line item is added for a single-cat booking
    Given the price rates are one-visit €15, two-visits €25, dog-walk €10, seasonal surcharge 0%, extra cat €5 per day
    And a booking from "2025-03-10" to "2025-03-12" for a cat with "morning" preference
    When the invoice line items are calculated
    Then the invoice has 1 line item
    And the invoice total is €45.00

  Scenario: No extra-cat line item is added when the extra-cat rate is 0
    Given the price rates are one-visit €15, two-visits €25, dog-walk €10, seasonal surcharge 0%, extra cat €0 per day
    And a booking from "2025-03-10" to "2025-03-12" for 2 cats with "morning" preference
    When the invoice line items are calculated
    Then the invoice has 1 line item
    And the invoice total is €45.00
