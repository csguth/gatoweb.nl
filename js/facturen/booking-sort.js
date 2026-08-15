// Pure helpers (issue #101): sorting logic for the facturen.html kanban columns.
//
// No i18n/DOM/Alpine/Supabase here on purpose — keeping it pure makes it easy to verify
// independently of the facturen app (see tests/bdd/features/booking-sort.feature).

// Inbox: bookings still awaiting approval, oldest first.
export function sortInbox(list) {
  return list.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

// Calendar order (by stay start date) for the confirmed column.
export function sortByDate(list) {
  return list.slice().sort((a, b) => new Date(a.date_from) - new Date(b.date_from));
}

// Completion date for a "Done" booking: when it was actually paid, falling back to when
// it was approved, and finally to when it was created — covers cancelled bookings, which
// have neither paid_at nor approved_at set.
export function completionDate(b) {
  return new Date(b.paid_at || b.approved_at || b.created_at);
}

// "Done" column: most recently completed bookings first, so Lígia sees what just
// wrapped up at the top instead of having to scroll to the bottom.
export function sortDoneByCompletionDesc(list) {
  return list.slice().sort((a, b) => completionDate(b) - completionDate(a));
}
