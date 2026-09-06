Feature: Google Calendar daily sync plan (diffing)
  As Lígia, editing an approved booking should not blow away every calendar
  event and recreate them from scratch — only the days that actually changed
  should be touched. Days unaffected by the edit keep their existing calendar
  event (same event id), days added to the range get a new event created,
  and days removed from the range get their event deleted (see
  supabase/functions/gcal-sync/logic.js, planDailySync, issue #160).

  Scenario: A freshly-approved booking creates one event per day, nothing to update or delete
    Given a booking from "2025-03-10" to "2025-03-12" with status "approved" and no existing calendar events
    When the daily sync plan is computed
    Then the plan creates events for "2025-03-10, 2025-03-11, 2025-03-12"
    And the plan updates no events
    And the plan deletes no events

  Scenario: Extending the date range only creates events for the new days
    Given a booking from "2025-03-10" to "2025-03-12" with status "approved" and existing calendar events for "2025-03-10, 2025-03-11, 2025-03-12"
    And the booking's date_to is changed to "2025-03-14"
    When the daily sync plan is computed
    Then the plan creates events for "2025-03-13, 2025-03-14"
    And the plan updates events for "2025-03-10, 2025-03-11, 2025-03-12"
    And the plan deletes no events

  Scenario: Shrinking the date range only deletes events for the removed days
    Given a booking from "2025-03-10" to "2025-03-14" with status "approved" and existing calendar events for "2025-03-10, 2025-03-11, 2025-03-12, 2025-03-13, 2025-03-14"
    And the booking's date_to is changed to "2025-03-12"
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates events for "2025-03-10, 2025-03-11, 2025-03-12"
    And the plan deletes events for "2025-03-13, 2025-03-14"

  Scenario: Changing the preference updates every existing day's event, without touching create/delete
    Given a booking from "2025-03-10" to "2025-03-11" with status "approved" and existing calendar events for "2025-03-10, 2025-03-11"
    And the booking's preference is changed to "evening"
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates events for "2025-03-10, 2025-03-11"
    And the plan deletes no events

  Scenario: Cancelling an approved booking deletes every existing day's event
    Given a booking from "2025-03-10" to "2025-03-12" with status "cancelled" and existing calendar events for "2025-03-10, 2025-03-11, 2025-03-12"
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates no events
    And the plan deletes events for "2025-03-10, 2025-03-11, 2025-03-12"

  Scenario: Deleting the booking row deletes every existing day's event regardless of status
    Given a booking from "2025-03-10" to "2025-03-12" with status "approved" and existing calendar events for "2025-03-10, 2025-03-11, 2025-03-12"
    And the row itself is being deleted
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates no events
    And the plan deletes events for "2025-03-10, 2025-03-11, 2025-03-12"

  Scenario: An update that only changes an unrelated field still keeps the plan a no-op
    Given a booking from "2025-03-10" to "2025-03-11" with status "approved" and existing calendar events for "2025-03-10, 2025-03-11"
    When the daily sync plan is computed
    Then the plan creates no events
    And the plan updates events for "2025-03-10, 2025-03-11"
    And the plan deletes no events
