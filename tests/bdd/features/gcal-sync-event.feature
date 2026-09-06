Feature: Google Calendar event content and time slot
  As Lígia, each VISIT of a booking gets its own Google Calendar event, carrying
  an approximate time slot for that visit (morning/evening/none) instead of
  being an all-day event, so she can manage each visit from her phone's
  calendar app. The slot is only a starting suggestion for organization — she
  can always adjust it directly in Google Calendar (see
  supabase/functions/gcal-sync/logic.js, issue #160).

  Scenario: Morning slot gets an early time window
    Given a booking for "Jane Doe" with pet "Mia"
    When the calendar event is built for "2025-03-11" in the "morning" slot
    Then the event starts at "2025-03-11T08:00:00" and ends at "2025-03-11T09:00:00" in timezone "Europe/Amsterdam"
    And the event is not an all-day event

  Scenario: Evening slot gets a late time window
    Given a booking for "Jane Doe" with pet "Mia"
    When the calendar event is built for "2025-03-11" in the "evening" slot
    Then the event starts at "2025-03-11T18:00:00" and ends at "2025-03-11T19:00:00" in timezone "Europe/Amsterdam"

  Scenario: No stated slot still gets a placeholder time window
    Given a booking for "Jane Doe" with pet "Mia"
    When the calendar event is built for "2025-03-11" in the "none" slot
    Then the event starts at "2025-03-11T09:00:00" and ends at "2025-03-11T10:00:00" in timezone "Europe/Amsterdam"

  Scenario: Event still includes a helpful summary and description
    Given a booking for "Jane Doe" with pet "Mia"
    When the calendar event is built for "2025-03-11" in the "morning" slot
    Then the event summary is "Catsitting — Jane Doe"
    And the event description contains "Mia"
    And the event description contains "morning"
