// Step definitions for tests/bdd/features/booking-sort.feature.
// Pure logic test: imports js/facturen/booking-sort.js directly (no DOM, no
// browser, no Supabase needed), matching that module's own "no i18n/DOM/Alpine"
// design (same pattern as invoice-calc.steps.mjs). Runs under cucumber-js
// puro instead of playwright-bdd — see tests/unit/cucumber.cjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { sortDoneByCompletionDesc } from '../../../static/js/facturen/booking-sort.js';

Given('a paid booking {string} paid on {string}', async (name, paidAt) => {
  world.bookings = world.bookings || [];
  world.bookings.push({ name, status: 'approved', factuur_number: world.bookings.length + 1, paid_at: paidAt, created_at: paidAt });
});

Given('a cancelled booking {string} created on {string}', async (name, createdAt) => {
  world.bookings = world.bookings || [];
  world.bookings.push({ name, status: 'cancelled', factuur_number: null, paid_at: null, approved_at: null, created_at: createdAt });
});

Given('a booking {string} approved on {string} with no paid_at', async (name, approvedAt) => {
  world.bookings = world.bookings || [];
  world.bookings.push({ name, status: 'approved', factuur_number: world.bookings.length + 1, paid_at: null, approved_at: approvedAt, created_at: approvedAt });
});

When('the done column is sorted', async () => {
  world.result = sortDoneByCompletionDesc(world.bookings);
});

Then('the done order is {string}', async (expected) => {
  const actual = world.result.map(b => b.name).join(', ');
  if (actual !== expected) {
    throw new Error(`Expected done order to be "${expected}" but got "${actual}"`);
  }
});
