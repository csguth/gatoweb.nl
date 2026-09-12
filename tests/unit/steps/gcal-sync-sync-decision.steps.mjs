// Step definitions for tests/bdd/features/gcal-sync-sync-decision.feature.
// Pure logic test: imports supabase/functions/gcal-sync/logic.js directly (no
// DOM, no browser, no Deno runtime, no real Google/Supabase calls needed) —
// same pattern as gcal-sync-event.steps.mjs / invoice-calc.steps.mjs. Runs
// under cucumber-js puro instead of playwright-bdd — see tests/unit/cucumber.cjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { decideSyncAction } from '../../../supabase/functions/gcal-sync/logic.js';

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
    tikkie_sent: false,
    google_event_ids: {},
    ...overrides
  };
}

Given('a booking with status {string} and no calendar events', async (status) => {
  world.record = makeRecord({ status, google_event_ids: {} });
});

Given('a booking with status {string} and calendar events for {string}', async (status, dates) => {
  const google_event_ids = {};
  dates.split(',').forEach((d, i) => {
    google_event_ids[d.trim()] = `evt-${i + 1}`;
  });
  world.record = makeRecord({ status, google_event_ids });
});

Given('the booking previously had status {string}', async (status) => {
  world.oldRecord = { ...world.record, status };
});

Given("the booking's {word} changed from {string} to {string}", async (field, from, to) => {
  world.oldRecord[field] = from;
  world.record[field] = to;
});

Given("the booking's tikkie_sent flag changed", async () => {
  world.oldRecord.tikkie_sent = false;
  world.record.tikkie_sent = true;
});

When('a new booking row is inserted', async () => {
  world.result = decideSyncAction({ type: 'INSERT', record: world.record });
});

When('the booking row is updated', async () => {
  world.result = decideSyncAction({ type: 'UPDATE', record: world.record, old_record: world.oldRecord });
});

When('the booking row is deleted', async () => {
  world.result = decideSyncAction({ type: 'DELETE', record: world.record });
});

Then('the sync action is {string}', async (action) => {
  if (world.result.action !== action) {
    throw new Error(
      `Expected sync action "${action}" but got "${world.result.action}" (reason: ${world.result.reason})`
    );
  }
});
