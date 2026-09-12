// Step definitions for tests/bdd/features/date-format.feature (issue #78).
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { makeBooking, seedBookings } from './account-tikkie.steps.mjs';

const { When, Then } = createBdd();

function app(page) {
  return page.locator('[data-x-data="accountApp()"]');
}

When(
  'my bookings include a booking from {string} to {string}',
  async ({ page }, from, to) => {
    await seedBookings(page, [makeBooking({ date_from: from, date_to: to })]);
  }
);

Then('I see the booking dates {string}', async ({ page }, expected) => {
  await expect(app(page)).toContainText(expected);
});

