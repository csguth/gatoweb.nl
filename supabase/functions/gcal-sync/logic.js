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
// Keeping the actual decision-making (what time slot? one event per visit?
// which occurrences need creating/updating/deleting?) in here, fully covered
// by Gherkin scenarios that read as plain product requirements, is what
// should let this feature survive being picked up by a human developer (or a
// different LLM) later without having to reverse-engineer the rules from
// imperative glue code.

export const TIMEZONE = "Europe/Amsterdam";

// Approximate, admin-only time windows per VISIT slot (issue #160): the exact
// hour doesn't matter — it's only a starting suggestion for Lígia's own
// organization, and she can freely drag the event to a different time in her
// calendar app afterwards. Adjust these if the "typical" visit times change.
// Note there is no "both" entry here: "both" is not a time window of its own,
// it resolves to TWO separate occurrences (one "morning", one "evening") on
// the same day — see slotsForPreference/occurrencesInRange below.
export const SLOT_WINDOWS = {
  morning: { startTime: "08:00", endTime: "09:00" },
  evening: { startTime: "18:00", endTime: "19:00" },
  // No preference stated: still give a nominal slot rather than falling back
  // to an all-day event.
  none: { startTime: "09:00", endTime: "10:00" },
};

export function resolveEventTimeWindow(slot) {
  return SLOT_WINDOWS[slot] || SLOT_WINDOWS.none;
}

// Maps a booking's visit preference to the list of VISIT SLOTS it needs per
// day. "both" (two visits a day) is the only preference that expands to more
// than one slot — each slot becomes its own separate calendar event/occurrence
// (see occurrencesInRange), rather than a single event spanning both visits.
export const SLOTS_FOR_PREFERENCE = {
  morning: ["morning"],
  evening: ["evening"],
  both: ["morning", "evening"],
};

export function slotsForPreference(preference) {
  return SLOTS_FOR_PREFERENCE[preference] || ["none"];
}

// Expands a booking's [date_from, date_to] (inclusive, date_to defaults to
// date_from for a single-day stay) into one 'YYYY-MM-DD' string per day.
export function datesInRange(dateFrom, dateTo) {
  const end = dateTo || dateFrom;
  const dates = [];
  for (let d = dateFrom; d <= end; d = addOneDay(d)) {
    dates.push(d);
  }
  return dates;
}

function addOneDay(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// A stable string key identifying one (date, slot) occurrence — the unit that
// gets exactly one Google Calendar event. Used as the key in a booking's
// `google_event_ids` map (see planDailySync below).
export function occurrenceKey(date, slot) {
  return `${date}#${slot}`;
}

// Expands a booking's date range x visit preference into the full list of
// (date, slot) occurrences that need a calendar event — one per day for
// "morning"/"evening"/no-preference, but TWO per day (one "morning", one
// "evening") for "both", since two visits on the same day are two separate
// events rather than one long one.
export function occurrencesInRange(dateFrom, dateTo, preference) {
  const dates = datesInRange(dateFrom, dateTo);
  const slots = slotsForPreference(preference);
  const occurrences = [];
  for (const date of dates) {
    for (const slot of slots) {
      occurrences.push({ date, slot, key: occurrenceKey(date, slot) });
    }
  }
  return occurrences;
}

function petsSummary(pets) {
  if (!Array.isArray(pets) || pets.length === 0) return "";
  return pets
    .map((p) => (typeof p === "string" ? p : p?.name ?? ""))
    .filter(Boolean)
    .join(", ");
}

// Builds the Google Calendar event body for a single VISIT occurrence. Always
// a timed (non all-day) event, per issue #160 — see resolveEventTimeWindow
// above for how the time window is derived from `slot`. `date` is a
// 'YYYY-MM-DD' string and `slot` is 'morning' | 'evening' | 'none', normally
// produced by occurrencesInRange().
export function buildEventBody(record, date, slot) {
  const summary = `Catsitting — ${record.client_name || record.client_email || "Client"}`;
  const petsLine = petsSummary(record.pets);
  const descriptionLines = [
    record.client_email ? `Email: ${record.client_email}` : null,
    record.client_contact ? `Contact: ${record.client_contact}` : null,
    petsLine ? `Pets: ${petsLine}` : null,
    `Visit: ${slot}`,
  ].filter(Boolean);

  const { startTime, endTime } = resolveEventTimeWindow(slot);

  return {
    summary,
    description: descriptionLines.join("\n"),
    start: { dateTime: `${date}T${startTime}:00`, timeZone: TIMEZONE },
    end: { dateTime: `${date}T${endTime}:00`, timeZone: TIMEZONE },
    status: "confirmed",
    reminders: { useDefault: true },
  };
}

// Booking fields that affect the calendar events' existence or content (see
// buildEventBody/planDailySync) — a change to any *other* field (e.g.
// tikkie_sent, final_amount) must NOT trigger any Calendar API call. Keep this
// list in sync with the trigger's WHEN clause in supabase/schema.sql
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

// Decides WHETHER gcal-sync's Edge Function adapter should bother computing/
// executing a sync plan at all (see planDailySync below) — a cheap gate that
// avoids calling the Google Calendar API on every single booking update, even
// ones completely unrelated to the calendar (e.g. toggling tikkie_sent). Pure
// decision logic — no Google/Supabase calls happen here.
//
// `payload` = { type: 'INSERT' | 'UPDATE' | 'DELETE', record, old_record? }
// (matches the shape notify_gcal_sync() in supabase/schema.sql sends — for
// DELETE, `record` is the deleted row itself, i.e. `old` in the trigger).
//
// Returns { action: 'sync' | 'skip', reason }.
export function decideSyncAction({ type, record, old_record: oldRecord }) {
  const hasExistingEvents = Object.keys(record.google_event_ids || {}).length > 0;

  if (type === "DELETE") {
    return hasExistingEvents
      ? { action: "sync", reason: "booking row deleted" }
      : { action: "skip", reason: "deleted booking had no calendar events" };
  }

  if (type === "INSERT") {
    return record.status === "approved"
      ? { action: "sync", reason: "booking inserted already approved" }
      : { action: "skip", reason: "booking is not approved" };
  }

  // UPDATE: only bother syncing if a relevant field changed AND the booking
  // is (or was) approved / already has events on the calendar — e.g. a
  // pending booking edited then cancelled without ever being approved has
  // nothing on the calendar to touch, even though `status` itself changed.
  const wasOrIsApproved = record.status === "approved" || oldRecord?.status === "approved";
  if (!relevantFieldsChanged(record, oldRecord)) {
    return { action: "skip", reason: "no calendar-relevant field changed" };
  }
  return wasOrIsApproved || hasExistingEvents
    ? { action: "sync", reason: "a field used by the calendar events changed" }
    : { action: "skip", reason: "booking was never approved and has no calendar events" };
}

// Computes exactly which per-occurrence calendar events need to be created,
// updated (in place, preserving the existing event id) or deleted, by diffing
// the booking's DESIRED occurrences (its current date range x preference, if
// still approved — none at all if not approved or if the row itself was
// deleted) against the occurrences that ALREADY have an event
// (`record.google_event_ids`, a { 'date#slot': eventId } map maintained by the
// Edge Function adapter). This is what lets an edit (e.g. extending the date
// range, or changing the preference) only touch the occurrences that actually
// need it instead of tearing down and recreating everything on every change —
// including switching to/from "both", which adds/removes just the second
// visit's occurrence without disturbing the first one.
//
// `payload` = { type: 'INSERT' | 'UPDATE' | 'DELETE', record } — only the
// CURRENT record is needed (not old_record): record.google_event_ids already
// captures "what existed before this operation", since the Edge Function
// adapter is the only writer of that column and does so AFTER executing the
// plan below.
//
// Returns { toCreate: [{key, date, slot, body}],
//           toUpdate: [{key, date, slot, eventId, body}],
//           toDelete: [{key, eventId}] }.
export function planDailySync({ type, record }) {
  const existingByKey = record.google_event_ids || {};
  const isApproved = record.status === "approved";
  const desiredOccurrences =
    type === "DELETE" || !isApproved
      ? []
      : occurrencesInRange(record.date_from, record.date_to, record.preference);
  const desiredKeys = new Set(desiredOccurrences.map((o) => o.key));

  const toCreate = desiredOccurrences
    .filter((o) => !(o.key in existingByKey))
    .map((o) => ({ key: o.key, date: o.date, slot: o.slot, body: buildEventBody(record, o.date, o.slot) }));

  const toUpdate = desiredOccurrences
    .filter((o) => o.key in existingByKey)
    .map((o) => ({
      key: o.key,
      date: o.date,
      slot: o.slot,
      eventId: existingByKey[o.key],
      body: buildEventBody(record, o.date, o.slot),
    }));

  const toDelete = Object.keys(existingByKey)
    .filter((key) => !desiredKeys.has(key))
    .map((key) => ({ key, eventId: existingByKey[key] }));

  return { toCreate, toUpdate, toDelete };
}
