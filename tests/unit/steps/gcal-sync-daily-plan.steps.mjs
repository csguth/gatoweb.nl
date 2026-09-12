// Step definitions for tests/bdd/features/gcal-sync-daily-plan.feature.
// Pure logic test: imports supabase/functions/gcal-sync/logic.js directly (no
// DOM, no browser, no Deno runtime, no real Google/Supabase calls needed) —
// same pattern as gcal-sync-event.steps.mjs / invoice-calc.steps.mjs. Runs
// under cucumber-js puro instead of playwright-bdd — see tests/unit/cucumber.cjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { planDailySync, occurrenceKey } from '../../../supabase/functions/gcal-sync/logic.js';

function makeRecord(overrides) {
  return {
    id: 'booking-1',
    client_name: 'Jane Doe',
    client_email: 'jane@example.com',
    client_contact: '0612345678',
    date_from: '2025-03-10',
    date_to: '2025-03-12',
    pets: [{ type: 'cat', name: 'Mia' }],
    preference: 'morning',
    google_event_ids: {},
    ...overrides
  };
}

// Parses a comma-separated list of "YYYY-MM-DD slot" occurrences (as written
// in the Gherkin) into a { key: eventId } map, one evt-N per occurrence.
function eventIdsFor(occurrencesText) {
  const google_event_ids = {};
  occurrencesText.split(',').forEach((entry, i) => {
    const [date, slot] = entry.trim().split(' ');
    google_event_ids[occurrenceKey(date, slot)] = `evt-${i + 1}`;
  });
  return google_event_ids;
}

Given(
  'a booking from {string} to {string} with {string} preference, status {string} and no existing calendar events',
  async (from, to, preference, status) => {
    world.type = 'UPDATE';
    world.record = makeRecord({ date_from: from, date_to: to, preference, status, google_event_ids: {} });
  }
);

Given(
  'a booking from {string} to {string} with {string} preference, status {string} and existing calendar events for {string}',
  async (from, to, preference, status, occurrencesText) => {
    world.type = 'UPDATE';
    world.record = makeRecord({
      date_from: from,
      date_to: to,
      preference,
      status,
      google_event_ids: eventIdsFor(occurrencesText)
    });
  }
);

Given("the booking's date_to is changed to {string}", async (newDateTo) => {
  world.record.date_to = newDateTo;
});

Given("the booking's preference is changed to {string}", async (preference) => {
  world.record.preference = preference;
});

Given('the row itself is being deleted', async () => {
  world.type = 'DELETE';
});

When('the daily sync plan is computed', async () => {
  world.plan = planDailySync({ type: world.type, record: world.record });
});

function occurrenceTextsOf(list) {
  return [...list].map((item) => `${item.date} ${item.slot}`).sort();
}

function parseOccurrenceTexts(expected) {
  return expected
    .split(',')
    .map((s) => s.trim())
    .sort();
}

Then('the plan creates events for {string}', async (expected) => {
  expectDeepEqual(occurrenceTextsOf(world.plan.toCreate), parseOccurrenceTexts(expected), 'toCreate occurrences');
});

Then('the plan creates no events', async () => {
  expectDeepEqual(world.plan.toCreate, [], 'toCreate');
});

Then('the plan updates events for {string}', async (expected) => {
  expectDeepEqual(occurrenceTextsOf(world.plan.toUpdate), parseOccurrenceTexts(expected), 'toUpdate occurrences');
});

Then('the plan updates no events', async () => {
  expectDeepEqual(world.plan.toUpdate, [], 'toUpdate');
});

Then('the plan deletes events for {string}', async (expected) => {
  // toDelete items only carry {key, eventId} (the occurrence was already
  // removed from the desired set, so we don't have a fresh date/slot to
  // rebuild from) — recover date/slot by splitting the "date#slot" key.
  const actual = world.plan.toDelete
    .map((item) => item.key.replace('#', ' '))
    .sort();
  expectDeepEqual(actual, parseOccurrenceTexts(expected), 'toDelete occurrences');
});

Then('the plan deletes no events', async () => {
  expectDeepEqual(world.plan.toDelete, [], 'toDelete');
});

function expectDeepEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`Expected ${label} to be ${e} but got ${a}`);
  }
}
