Feature: Google Calendar occurrence sync plan (diffing)
  As Lígia, editing an approved booking should not blow away every calendar
  event and recreate them from scratch — only the (date, slot) occurrences
  that actually changed should be touched. Occurrences unaffected by the edit
  keep their existing calendar event (same event id), occurrences added get a
  new event created, and occurrences removed get their event deleted. This
  includes switching between "morning"/"evening" and "both": "both" adds a
  second occurrence on the same day rather than replacing the first one (see
  supabase/functions/gcal-sync/logic.js, planDailySync, issue #160).

  Scenario: A freshly-approved booking creates one event per day, nothing to update or delete
    Given a booking from "2025-03-10" to "2025-03-12" with "morning" preference, status "approved" and no existing calendar events
    When the daily sync plan is computed
    Then the plan creates events for "2025-03-10 morning, 2025-03-11 morning, 2025-03-12 morning"
    And the plan updates no events
    And the plan deletes no events

  Scenario: Extending the date range only creates events for the new days
    Given a booking from "2025-03-10" to "2025-03-12" with "morning" preference, status "approved" and existing calendar events for "2025-03-10 morning, 2025-03-11 morning, 2025-03-12 morning"
    And the booking's date_to is changed to "2025-03-14"
    When the daily sync plan is computed
    Then the plan creates events for "2025-03-13 morning, 2025-03-14 morning"
    And the plan updates events for "2025-03-10 morning, 2025-03-11 morning, 2025-03-12 morning"
    And the plan deletes no events

  Scenario: Shrinking the date range only deletes events for the removed days
    Given a booking from "2025-03-10" to "2025-03-14" with "morning" preference, status "approved" and existing calendar events for "2025-03-10 morning, 2025-03-11 morning, 2025-03-12 morning, 2025-03-13 morning, 2025-03-14 morning"
    And the booking's date_to is changed to "2025-03-12"
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates events for "2025-03-10 morning, 2025-03-11 morning, 2025-03-12 morning"
    And the plan deletes events for "2025-03-13 morning, 2025-03-14 morning"

  Scenario: Changing the preference between single slots creates the new slot and deletes the old one
    Given a booking from "2025-03-10" to "2025-03-11" with "morning" preference, status "approved" and existing calendar events for "2025-03-10 morning, 2025-03-11 morning"
    And the booking's preference is changed to "evening"
    When the daily sync plan is computed
    Then the plan creates events for "2025-03-10 evening, 2025-03-11 evening"
    And the plan updates no events
    And the plan deletes events for "2025-03-10 morning, 2025-03-11 morning"

  Scenario: Switching from "morning" to "both" adds a new evening occurrence and keeps the morning one
    Given a booking from "2025-03-10" to "2025-03-10" with "morning" preference, status "approved" and existing calendar events for "2025-03-10 morning"
    And the booking's preference is changed to "both"
    When the daily sync plan is computed
    Then the plan creates events for "2025-03-10 evening"
    And the plan updates events for "2025-03-10 morning"
    And the plan deletes no events

  Scenario: Switching from "both" to "morning" deletes the evening occurrence and keeps the morning one
    Given a booking from "2025-03-10" to "2025-03-10" with "both" preference, status "approved" and existing calendar events for "2025-03-10 morning, 2025-03-10 evening"
    And the booking's preference is changed to "morning"
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates events for "2025-03-10 morning"
    And the plan deletes events for "2025-03-10 evening"

  Scenario: A freshly-approved "both" booking creates two events per day
    Given a booking from "2025-03-10" to "2025-03-11" with "both" preference, status "approved" and no existing calendar events
    When the daily sync plan is computed
    Then the plan creates events for "2025-03-10 morning, 2025-03-10 evening, 2025-03-11 morning, 2025-03-11 evening"
    And the plan updates no events
    And the plan deletes no events

  Scenario: Cancelling an approved booking deletes every existing occurrence
    Given a booking from "2025-03-10" to "2025-03-11" with "both" preference, status "cancelled" and existing calendar events for "2025-03-10 morning, 2025-03-10 evening, 2025-03-11 morning, 2025-03-11 evening"
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates no events
    And the plan deletes events for "2025-03-10 morning, 2025-03-10 evening, 2025-03-11 morning, 2025-03-11 evening"

  Scenario: Deleting the booking row deletes every existing occurrence regardless of status
    Given a booking from "2025-03-10" to "2025-03-11" with "morning" preference, status "approved" and existing calendar events for "2025-03-10 morning, 2025-03-11 morning"
    And the row itself is being deleted
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates no events
    And the plan deletes events for "2025-03-10 morning, 2025-03-11 morning"

  Scenario: An update that only changes an unrelated field still keeps the plan a no-op
    Given a booking from "2025-03-10" to "2025-03-11" with "morning" preference, status "approved" and existing calendar events for "2025-03-10 morning, 2025-03-11 morning"
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates events for "2025-03-10 morning, 2025-03-11 morning"
    And the plan deletes no events
