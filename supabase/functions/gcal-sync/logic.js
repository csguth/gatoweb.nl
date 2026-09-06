// gcal-sync — pure business logic (issue #160).
//
// Framework-agnostic on purpose: no Deno/fetch/DOM APIs here, only plain JS +
// data in/data out. That's what lets this module be imported both by the Deno
// Edge Function (index.ts, the thin I/O adapter that talks to Google Calendar
// and Supabase) AND directly by the Node-based Playwright/BDD test suite
// (tests/bdd/steps/gcal-sync-*.steps.mjs) with no browser, no Deno runtime and
// no real network calls needed — same "pure module, thin adapter" pattern as
// static/js/facturen/invoice-calc.js.
//
// Keeping the actual decision-making (what time slot? create/update/delete/skip?)
// in here, fully covered by Gherkin scenarios that read as plain product
// requirements, is what should let this feature survive being picked up by a
// human developer (or a different LLM) later without having to reverse-engineer
// the rules from imperative glue code.

export const TIMEZONE = "Europe/Amsterdam";

// Approximate, admin-only time slots per visit preference (issue #160): the
// exact hour doesn't matter — it's only a starting suggestion for Lígia's own
// organization, and she can freely drag the event to a different time in her
// calendar app afterwards. Adjust these if the "typical" visit times change.
export const SLOT_WINDOWS = {
  morning: { startTime: "08:00", endTime: "09:00" },
  evening: { startTime: "18:00", endTime: "19:00" },
  // "both" (two visits/day) spans from the morning slot's start to the evening
  // slot's end, so the event covers the whole day both visits happen in.
  both: { startTime: "08:00", endTime: "19:00" },
  // No preference stated: still give a nominal slot rather than falling back
  // to an all-day event.
  none: { startTime: "09:00", endTime: "10:00" },
};

export function resolveEventTimeWindow(preference) {
  return SLOT_WINDOWS[preference] || SLOT_WINDOWS.none;
}

function petsSummary(pets) {
  if (!Array.isArray(pets) || pets.length === 0) return "";
  return pets
    .map((p) => (typeof p === "string" ? p : p?.name ?? ""))
    .filter(Boolean)
    .join(", ");
}

// Builds the Google Calendar event body for a booking record. Always a timed
// (non all-day) event now, per issue #160 — see resolveEventTimeWindow above
// for how the time slot is derived from `preference`.
export function buildEventBody(record) {
  const summary = `Catsitting — ${record.client_name || record.client_email || "Client"}`;
  const petsLine = petsSummary(record.pets);
  const descriptionLines = [
    record.client_email ? `Email: ${record.client_email}` : null,
    record.client_contact ? `Contact: ${record.client_contact}` : null,
    petsLine ? `Pets: ${petsLine}` : null,
    record.preference ? `Preference: ${record.preference}` : null,
  ].filter(Boolean);

  const { startTime, endTime } = resolveEventTimeWindow(record.preference);
  const startDate = record.date_from;
  const endDate = record.date_to || record.date_from;

  return {
    summary,
    description: descriptionLines.join("\n"),
    start: { dateTime: `${startDate}T${startTime}:00`, timeZone: TIMEZONE },
    end: { dateTime: `${endDate}T${endTime}:00`, timeZone: TIMEZONE },
    status: "confirmed",
    reminders: { useDefault: true },
  };
}

// Booking fields that affect the calendar event's content (see buildEventBody
// above) or whether it should exist at all (status). A change to any *other*
// field (e.g. tikkie_sent, final_amount) must NOT trigger a Calendar API call.
// Keep this list in sync with the trigger's WHEN clause in supabase/schema.sql
// (bookings_gcal_sync_relevant_update) — that's the one place this can't be
// shared directly, since one side is SQL and the other is JS.
export const RELEVANT_FIELDS = [
  "status",
  "date_from",
  "date_to",
  "pets",
  "preference",
  "client_name",
  "client_email",
  "client_contact",
];

function relevantFieldsChanged(record, oldRecord) {
  if (!oldRecord) return true;
  return RELEVANT_FIELDS.some(
    (field) => JSON.stringify(record[field]) !== JSON.stringify(oldRecord[field])
  );
}

// Decides what (if anything) gcal-sync's Edge Function adapter should do in
// reaction to a `bookings` row change. Pure decision logic — no Google/Supabase
// calls happen here, only the decision + a human-readable reason for it.
//
// `payload` = { type: 'INSERT' | 'UPDATE' | 'DELETE', record, old_record? }
// (matches the shape notify_gcal_sync() in supabase/schema.sql sends — for
// DELETE, `record` is the deleted row itself, i.e. `old` in the trigger).
//
// Returns { action: 'create' | 'update' | 'delete' | 'skip', reason }.
export function decideSyncAction({ type, record, old_record: oldRecord }) {
  if (type === "DELETE") {
    return record.google_event_id
      ? { action: "delete", reason: "booking row deleted" }
      : { action: "skip", reason: "deleted booking never had a calendar event" };
  }

  const isApproved = record.status === "approved";

  if (!isApproved) {
    return record.google_event_id
      ? { action: "delete", reason: "booking is no longer approved" }
      : { action: "skip", reason: "booking is not approved and has no calendar event" };
  }

  // From here on, record.status === 'approved'.
  if (!record.google_event_id) {
    return { action: "create", reason: "booking just became approved" };
  }

  if (type === "INSERT") {
    // Approved with an event id already on INSERT is unusual (e.g. imported
    // data) but is by definition already in sync.
    return { action: "skip", reason: "already has a calendar event" };
  }

  return relevantFieldsChanged(record, oldRecord)
    ? { action: "update", reason: "a field used by the calendar event changed" }
    : { action: "skip", reason: "no calendar-relevant field changed" };
}
