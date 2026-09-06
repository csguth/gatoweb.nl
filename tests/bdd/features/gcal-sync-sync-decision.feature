Feature: Google Calendar sync decision (gate)
  As Lígia, the Google Calendar sync should only do work (talk to the Google
  Calendar API at all) when something that actually affects the calendar
  changed — approval status, dates, pets, preference or client info — never
  on unrelated field changes (e.g. tikkie_sent), and always on delete. The
  specifics of WHAT gets created/updated/deleted per day are decided
  separately by planDailySync (see gcal-sync-daily-plan.feature); this gate
  only decides whether to bother computing/executing that plan at all (see
  supabase/functions/gcal-sync/logic.js, decideSyncAction, issue #160).

  Scenario: Inserting a pending booking does not touch the calendar
    Given a booking with status "pending" and no calendar events
    When a new booking row is inserted
    Then the sync action is "skip"

  Scenario: Inserting an already-approved booking triggers a sync
    Given a booking with status "approved" and no calendar events
    When a new booking row is inserted
    Then the sync action is "sync"

  Scenario: Approving a pending booking triggers a sync
    Given a booking with status "approved" and calendar events for "2025-03-10"
    And the booking previously had status "pending"
    When the booking row is updated
    Then the sync action is "sync"

  Scenario: Changing the dates of an approved booking triggers a sync
    Given a booking with status "approved" and calendar events for "2025-03-10"
    And the booking previously had status "approved"
    And the booking's date_to changed from "2025-03-12" to "2025-03-14"
    When the booking row is updated
    Then the sync action is "sync"

  Scenario: Changing the preference of an approved booking triggers a sync
    Given a booking with status "approved" and calendar events for "2025-03-10"
    And the booking previously had status "approved"
    And the booking's preference changed from "morning" to "evening"
    When the booking row is updated
    Then the sync action is "sync"

  Scenario: Changing an unrelated field does not touch the calendar
    Given a booking with status "approved" and calendar events for "2025-03-10"
    And the booking previously had status "approved"
    And the booking's tikkie_sent flag changed
    When the booking row is updated
    Then the sync action is "skip"

  Scenario: Cancelling an approved booking triggers a sync
    Given a booking with status "cancelled" and calendar events for "2025-03-10"
    And the booking previously had status "approved"
    When the booking row is updated
    Then the sync action is "sync"

  Scenario: Cancelling a booking that was never approved does nothing
    Given a booking with status "cancelled" and no calendar events
    And the booking previously had status "pending"
    When the booking row is updated
    Then the sync action is "skip"

  Scenario: Deleting a booking row with existing events triggers a sync
    Given a booking with status "approved" and calendar events for "2025-03-10"
    When the booking row is deleted
    Then the sync action is "sync"

  Scenario: Deleting a booking row with no calendar events does nothing
    Given a booking with status "pending" and no calendar events
    When the booking row is deleted
    Then the sync action is "skip"
