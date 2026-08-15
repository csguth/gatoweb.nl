Feature: Facturen kanban column sorting
  As Lígia, the "Done" column on facturen.html must show the most recently
  completed bookings first, so I don't have to scroll to find what just
  wrapped up (see js/facturen/booking-sort.js, issue #101).

  Scenario: Paid bookings are ordered by paid date, most recent first
    Given a paid booking "A" paid on "2025-08-01"
    And a paid booking "B" paid on "2025-08-10"
    And a paid booking "C" paid on "2025-08-05"
    When the done column is sorted
    Then the done order is "B, C, A"

  Scenario: A cancelled booking without paid_at or approved_at falls back to created_at
    Given a cancelled booking "A" created on "2025-08-01"
    And a paid booking "B" paid on "2025-08-05"
    When the done column is sorted
    Then the done order is "B, A"

  Scenario: An approved-but-not-yet-paid booking (old flow) falls back to approved_at
    Given a booking "A" approved on "2025-08-03" with no paid_at
    And a paid booking "B" paid on "2025-08-01"
    When the done column is sorted
    Then the done order is "A, B"
