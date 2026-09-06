Feature: Google Calendar sync decisions
  As Lígia, the Google Calendar should always reflect the current state of
  bookings — an event is created once a booking is approved, updated when a
  relevant detail changes, and removed as soon as the booking is no longer
  approved or its row is deleted — without ever creating duplicate events or
  reacting to unrelated field changes (see
  supabase/functions/gcal-sync/logic.js, decideSyncAction, issue #160).

  Scenario: Inserting a pending booking does not touch the calendar
    Given a booking with status "pending" and no calendar event
    When a new booking row is inserted
    Then the sync action is "skip"

  Scenario: Inserting an already-approved booking with no event creates one
    Given a booking with status "approved" and no calendar event
    When a new booking row is inserted
    Then the sync action is "create"

  Scenario: Inserting an already-approved booking that already has an event is a no-op
    Given a booking with status "approved" and calendar event "evt-1"
    When a new booking row is inserted
    Then the sync action is "skip"

  Scenario: Approving a pending booking creates its calendar event
    Given a booking with status "approved" and no calendar event
    And the booking previously had status "pending"
    When the booking row is updated
    Then the sync action is "create"

  Scenario: Changing the dates of an approved booking updates its calendar event
    Given a booking with status "approved" and calendar event "evt-1"
    And the booking previously had status "approved"
    And the booking's date_to changed from "2025-03-12" to "2025-03-14"
    When the booking row is updated
    Then the sync action is "update"

  Scenario: Changing the preference of an approved booking updates its calendar event
    Given a booking with status "approved" and calendar event "evt-1"
    And the booking previously had status "approved"
    And the booking's preference changed from "morning" to "evening"
    When the booking row is updated
    Then the sync action is "update"

  Scenario: Changing an unrelated field does not touch the calendar
    Given a booking with status "approved" and calendar event "evt-1"
    And the booking previously had status "approved"
    And the booking's tikkie_sent flag changed
    When the booking row is updated
    Then the sync action is "skip"

  Scenario: Cancelling an approved booking removes its calendar event
    Given a booking with status "cancelled" and calendar event "evt-1"
    And the booking previously had status "approved"
    When the booking row is updated
    Then the sync action is "delete"

  Scenario: Cancelling a booking that was never approved does nothing
    Given a booking with status "cancelled" and no calendar event
    And the booking previously had status "pending"
    When the booking row is updated
    Then the sync action is "skip"

  Scenario: Deleting a booking row removes its calendar event
    Given a booking with status "approved" and calendar event "evt-1"
    When the booking row is deleted
    Then the sync action is "delete"

  Scenario: Deleting a booking row with no calendar event does nothing
    Given a booking with status "pending" and no calendar event
    When the booking row is deleted
    Then the sync action is "skip"
