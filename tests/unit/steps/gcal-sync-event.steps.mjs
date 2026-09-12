// Step definitions for tests/bdd/features/gcal-sync-event.feature.
// Pure logic test: imports supabase/functions/gcal-sync/logic.js directly (no
// DOM, no browser, no Deno runtime needed), matching the same "pure module,
// thin I/O adapter" pattern as static/js/facturen/invoice-calc.js /
// invoice-calc.steps.mjs. Runs under cucumber-js puro instead of
// playwright-bdd — see tests/unit/cucumber.cjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { buildEventBody } from '../../../supabase/functions/gcal-sync/logic.js';

Given('a booking for {string} with pet {string}', async (clientName, petName) => {
  world.record = {
    client_name: clientName,
    client_email: 'jane@example.com',
    client_contact: '0612345678',
    pets: [{ type: 'cat', name: petName }]
  };
});

When('the calendar event is built for {string} in the {string} slot', async (date, slot) => {
  world.event = buildEventBody(world.record, date, slot);
});

Then(
  'the event starts at {string} and ends at {string} in timezone {string}',
  async (start, end, timeZone) => {
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

Then('the event summary is {string}', async (summary) => {
  expectEqual(world.event.summary, summary, 'event summary');
});

Then('the event description contains {string}', async (needle) => {
  if (!world.event.description.includes(needle)) {
    throw new Error(`Expected event description to contain "${needle}", got: ${world.event.description}`);
  }
});

function expectEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}
