// Step definitions for tests/bdd/features/format-date.feature (issue #78).
// Pure logic test: imports static/js/shared/format-date.js directly (no DOM,
// no browser needed). Runs under cucumber-js puro — see tests/unit/cucumber.cjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { formatDateDDMMYYYY } from '../../../static/js/shared/format-date.js';

When('I format the date {string}', async (input) => {
  world.formatted = formatDateDDMMYYYY(input);
});

Then('the formatted date is {string}', async (expected) => {
  if (world.formatted !== expected) {
    throw new Error(`Expected formatted date "${expected}" but got "${world.formatted}"`);
  }
});
