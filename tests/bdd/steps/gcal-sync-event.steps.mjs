// Step definitions for tests/bdd/features/gcal-sync-event.feature.
// Pure logic test: imports supabase/functions/gcal-sync/logic.js directly (no
// DOM, no browser, no Deno runtime needed), matching the same "pure module,
// thin I/O adapter" pattern as static/js/facturen/invoice-calc.js /
// tests/bdd/steps/invoice-calc.steps.mjs.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { buildEventBody, datesInRange } from '../../../supabase/functions/gcal-sync/logic.js';

const { Given, When, Then } = createBdd();

function baseRecord(overrides) {
  return {
    client_name: 'Jane Doe',
    client_email: 'jane@example.com',
    client_contact: '0612345678',
    pets: [{ type: 'cat', name: 'Mia' }],
    preference: 'morning',
    ...overrides
  };
}

Given('a booking from {string} to {string}', async ({}, from, to) => {
  world.record = baseRecord({ date_from: from, date_to: to });
});

Given('a booking from {string} with no end date', async ({}, from) => {
  world.record = baseRecord({ date_from: from, date_to: null });
});

Given('a booking with {string} preference', async ({}, preference) => {
  world.record = baseRecord({ preference });
});

Given('a booking with {string} preference for {string} with pet {string}', async ({}, preference, clientName, petName) => {
  world.record = baseRecord({ preference, client_name: clientName, pets: [{ type: 'cat', name: petName }] });
});

When('the dates in range are listed', async () => {
  world.dates = datesInRange(world.record.date_from, world.record.date_to);
});

Then('the dates are {string}', async ({}, expected) => {
  const expectedList = expected.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
  expectDeepEqual(world.dates, expectedList, 'dates in range');
});

When('the calendar event is built for {string}', async ({}, date) => {
  world.event = buildEventBody(world.record, date);
});

Then(
  'the event starts at {string} and ends at {string} in timezone {string}',
  async ({}, start, end, timeZone) => {
    expectEqual(world.event.start.dateTime, start, 'start dateTime');
    expectEqual(world.event.end.dateTime, end, 'end dateTime');
    expectEqual(world.event.start.timeZone, timeZone, 'start timeZone');
    expectEqual(world.event.end.timeZone, timeZone, 'end timeZone');
  }
);

Then('the event is not an all-day event', async () => {
  if (world.event.start.date || world.event.end.date) {
    throw new Error('Expected a timed event, but got an all-day event (start.date/end.date present)');
  }
});

Then('the event summary is {string}', async ({}, summary) => {
  expectEqual(world.event.summary, summary, 'event summary');
});

Then('the event description contains {string}', async ({}, needle) => {
  if (!world.event.description.includes(needle)) {
    throw new Error(`Expected event description to contain "${needle}", got: ${world.event.description}`);
  }
});

function expectEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}

function expectDeepEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`Expected ${label} to be ${e} but got ${a}`);
  }
}
