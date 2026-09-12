// Step definitions for tests/bdd/features/gcal-sync-occurrences.feature.
// Pure logic test: imports supabase/functions/gcal-sync/logic.js directly (no
// DOM, no browser, no Deno runtime needed) — same pattern as
// gcal-sync-event.steps.mjs / invoice-calc.steps.mjs. Runs under cucumber-js
// puro instead of playwright-bdd — see tests/unit/cucumber.cjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { datesInRange, occurrencesInRange } from '../../../supabase/functions/gcal-sync/logic.js';

Given('a booking from {string} to {string}', async (from, to) => {
  world.dateFrom = from;
  world.dateTo = to;
});

Given('a booking from {string} with no end date', async (from) => {
  world.dateFrom = from;
  world.dateTo = null;
});

Given('a booking from {string} to {string} with {string} preference', async (from, to, preference) => {
  world.dateFrom = from;
  world.dateTo = to;
  world.preference = preference;
});

When('the dates in range are listed', async () => {
  world.dates = datesInRange(world.dateFrom, world.dateTo);
});

Then('the dates are {string}', async (expected) => {
  const expectedList = expected.split(',').map((s) => s.trim());
  expectDeepEqual(world.dates, expectedList, 'dates in range');
});

When('the occurrences in range are listed', async () => {
  world.occurrences = occurrencesInRange(world.dateFrom, world.dateTo, world.preference);
});

Then('the occurrences are {string}', async (expected) => {
  const expectedList = expected.split(',').map((s) => s.trim());
  const actualList = world.occurrences.map((o) => `${o.date} ${o.slot}`);
  expectDeepEqual(actualList, expectedList, 'occurrences in range');
});

function expectDeepEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`Expected ${label} to be ${e} but got ${a}`);
  }
}
