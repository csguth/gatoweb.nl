// Step definitions for tests/bdd/features/gcal-sync-daily-plan.feature.
// Pure logic test: imports supabase/functions/gcal-sync/logic.js directly (no
// DOM, no browser, no Deno runtime, no real Google/Supabase calls needed) —
// same pattern as gcal-sync-event.steps.mjs / invoice-calc.steps.mjs.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { planDailySync } from '../../../supabase/functions/gcal-sync/logic.js';

const { Given, When, Then } = createBdd();

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

function eventIdsFor(dates) {
  const google_event_ids = {};
  dates.split(',').forEach((d, i) => {
    google_event_ids[d.trim()] = `evt-${i + 1}`;
  });
  return google_event_ids;
}

Given(
  'a booking from {string} to {string} with status {string} and no existing calendar events',
  async ({}, from, to, status) => {
    world.type = 'UPDATE';
    world.record = makeRecord({ date_from: from, date_to: to, status, google_event_ids: {} });
  }
);

Given(
  'a booking from {string} to {string} with status {string} and existing calendar events for {string}',
  async ({}, from, to, status, dates) => {
    world.type = 'UPDATE';
    world.record = makeRecord({ date_from: from, date_to: to, status, google_event_ids: eventIdsFor(dates) });
  }
);

Given("the booking's date_to is changed to {string}", async ({}, newDateTo) => {
  world.record.date_to = newDateTo;
});

Given("the booking's preference is changed to {string}", async ({}, preference) => {
  world.record.preference = preference;
});

Given('the row itself is being deleted', async () => {
  world.type = 'DELETE';
});

When('the daily sync plan is computed', async () => {
  world.plan = planDailySync({ type: world.type, record: world.record });
});

function datesOf(list) {
  return [...list].map((item) => item.date).sort();
}

function parseDates(expected) {
  return expected
    .split(',')
    .map((s) => s.trim())
    .sort();
}

Then('the plan creates events for {string}', async ({}, expected) => {
  expectDeepEqual(datesOf(world.plan.toCreate), parseDates(expected), 'toCreate dates');
});

Then('the plan creates no events', async () => {
  expectDeepEqual(world.plan.toCreate, [], 'toCreate');
});

Then('the plan updates events for {string}', async ({}, expected) => {
  expectDeepEqual(datesOf(world.plan.toUpdate), parseDates(expected), 'toUpdate dates');
});

Then('the plan updates no events', async () => {
  expectDeepEqual(world.plan.toUpdate, [], 'toUpdate');
});

Then('the plan deletes events for {string}', async ({}, expected) => {
  expectDeepEqual(datesOf(world.plan.toDelete), parseDates(expected), 'toDelete dates');
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
