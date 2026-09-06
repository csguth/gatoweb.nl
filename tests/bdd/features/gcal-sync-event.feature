Feature: Google Calendar per-day event content and time slot
  As Lígia, each DAY of a booking gets its own Google Calendar event (not one
  event spanning the whole stay), carrying an approximate time slot derived
  from what was contracted (morning/evening/both/none) instead of being an
  all-day event, so she can manage each visit from her phone's calendar app.
  The slot is only a starting suggestion for organization — she can always
  adjust it directly in Google Calendar (see
  supabase/functions/gcal-sync/logic.js, issue #160).

  Scenario: A booking's date range expands into one date per day
    Given a booking from "2025-03-10" to "2025-03-12"
    When the dates in range are listed
    Then the dates are "2025-03-10, 2025-03-11, 2025-03-12"

  Scenario: A single-day booking (no end date) is just that one date
    Given a booking from "2025-03-10" with no end date
    When the dates in range are listed
    Then the dates are "2025-03-10"

  Scenario: Morning-only booking gets an early time slot for that day
    Given a booking with "morning" preference
    When the calendar event is built for "2025-03-11"
    Then the event starts at "2025-03-11T08:00:00" and ends at "2025-03-11T09:00:00" in timezone "Europe/Amsterdam"
    And the event is not an all-day event

  Scenario: Evening-only booking gets a late time slot for that day
    Given a booking with "evening" preference
    When the calendar event is built for "2025-03-11"
    Then the event starts at "2025-03-11T18:00:00" and ends at "2025-03-11T19:00:00" in timezone "Europe/Amsterdam"

  Scenario: Two-visits-a-day booking spans the morning slot start to the evening slot end
    Given a booking with "both" preference
    When the calendar event is built for "2025-03-11"
    Then the event starts at "2025-03-11T08:00:00" and ends at "2025-03-11T19:00:00" in timezone "Europe/Amsterdam"

  Scenario: No stated preference still gets a placeholder slot
    Given a booking with "none" preference
    When the calendar event is built for "2025-03-11"
    Then the event starts at "2025-03-11T09:00:00" and ends at "2025-03-11T10:00:00" in timezone "Europe/Amsterdam"

  Scenario: Event still includes a helpful summary and description
    Given a booking with "morning" preference for "Jane Doe" with pet "Mia"
    When the calendar event is built for "2025-03-11"
    Then the event summary is "Catsitting — Jane Doe"
    And the event description contains "Mia"
