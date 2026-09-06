Feature: Google Calendar occurrence expansion (date x slot)
  As Lígia, a booking's date range and visit preference together determine
  exactly which (date, slot) occurrences need a calendar event: one visit
  ("morning" or "evening") means one occurrence per day, "both" (two visits a
  day) means TWO separate occurrences on the SAME day — one in the morning
  slot and one in the evening slot, each its own event — and "none" means one
  placeholder occurrence per day (see
  supabase/functions/gcal-sync/logic.js, occurrencesInRange, issue #160).

  Scenario: A booking's date range expands into one date per day
    Given a booking from "2025-03-10" to "2025-03-12"
    When the dates in range are listed
    Then the dates are "2025-03-10, 2025-03-11, 2025-03-12"

  Scenario: A single-day booking (no end date) is just that one date
    Given a booking from "2025-03-10" with no end date
    When the dates in range are listed
    Then the dates are "2025-03-10"

  Scenario: A morning-only booking has one occurrence per day
    Given a booking from "2025-03-10" to "2025-03-11" with "morning" preference
    When the occurrences in range are listed
    Then the occurrences are "2025-03-10 morning, 2025-03-11 morning"

  Scenario: An evening-only booking has one occurrence per day
    Given a booking from "2025-03-10" to "2025-03-11" with "evening" preference
    When the occurrences in range are listed
    Then the occurrences are "2025-03-10 evening, 2025-03-11 evening"

  Scenario: A "both" booking has TWO occurrences per day, morning and evening
    Given a booking from "2025-03-10" to "2025-03-11" with "both" preference
    When the occurrences in range are listed
    Then the occurrences are "2025-03-10 morning, 2025-03-10 evening, 2025-03-11 morning, 2025-03-11 evening"

  Scenario: A booking with no stated preference has one placeholder occurrence per day
    Given a booking from "2025-03-10" to "2025-03-11" with "none" preference
    When the occurrences in range are listed
    Then the occurrences are "2025-03-10 none, 2025-03-11 none"
