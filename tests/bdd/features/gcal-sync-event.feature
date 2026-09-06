Feature: Google Calendar event time slot
  As Lígia, each booking's Google Calendar event should carry an approximate
  time slot derived from what was contracted (morning/evening/both/none)
  instead of being an all-day event, so she can manage it from her phone's
  calendar app. The slot is only a starting suggestion for organization — she
  can always adjust it directly in Google Calendar (see
  supabase/functions/gcal-sync/logic.js, issue #160).

  Scenario: Morning-only booking gets an early time slot
    Given a booking from "2025-03-10" to "2025-03-12" with "morning" preference
    When the calendar event is built
    Then the event starts at "2025-03-10T08:00:00" and ends at "2025-03-12T09:00:00" in timezone "Europe/Amsterdam"
    And the event is not an all-day event

  Scenario: Evening-only booking gets a late time slot
    Given a booking from "2025-03-10" to "2025-03-12" with "evening" preference
    When the calendar event is built
    Then the event starts at "2025-03-10T18:00:00" and ends at "2025-03-12T19:00:00" in timezone "Europe/Amsterdam"

  Scenario: Two-visits-a-day booking spans the morning slot start to the evening slot end
    Given a booking from "2025-03-10" to "2025-03-12" with "both" preference
    When the calendar event is built
    Then the event starts at "2025-03-10T08:00:00" and ends at "2025-03-12T19:00:00" in timezone "Europe/Amsterdam"

  Scenario: No stated preference still gets a placeholder slot
    Given a booking from "2025-03-10" to "2025-03-12" with "none" preference
    When the calendar event is built
    Then the event starts at "2025-03-10T09:00:00" and ends at "2025-03-12T10:00:00" in timezone "Europe/Amsterdam"

  Scenario: Single-day booking uses the same date for start and end
    Given a booking from "2025-03-10" to "2025-03-10" with "morning" preference
    When the calendar event is built
    Then the event starts at "2025-03-10T08:00:00" and ends at "2025-03-10T09:00:00" in timezone "Europe/Amsterdam"

  Scenario: Booking without an explicit end date is treated as a single day
    Given a booking from "2025-03-10" with no end date and "evening" preference
    When the calendar event is built
    Then the event starts at "2025-03-10T18:00:00" and ends at "2025-03-10T19:00:00" in timezone "Europe/Amsterdam"

  Scenario: Event still includes a helpful summary and description
    Given a booking from "2025-03-10" to "2025-03-12" with "morning" preference
    When the calendar event is built
    Then the event summary is "Catsitting — Jane Doe"
    And the event description contains "Mia"
