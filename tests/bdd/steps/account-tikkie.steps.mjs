// Step definitions for tests/bdd/features/tikkie-link.feature (account.html +
// js/account/account-app.js, issue #63). Runs against the "production-auth"
// fixture (Supabase "configured" with a fake project) via the @auth-required tag,
// so accountApp()'s `configured` flag is true and the bookings list renders.
//
// There's no real backend, so instead of logging in for real we seed a fake
// session + bookings straight into the Alpine component's reactive state (the
// same Alpine.$data() bridge booking-form.steps.mjs uses), then assert on the
// rendered cards.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

function app(page) {
  return page.locator('[x-data="accountApp()"]');
}

function payLink(page) {
  return app(page).getByRole('link', { name: /Pay with Tikkie/ });
}

function makeBooking(overrides) {
  return {
    id: 'test-booking-1',
    created_at: '2025-08-01T00:00:00Z',
    status: 'approved',
    tikkie_sent: true,
    tikkie_url: null,
    factuur_number: 1,
    approved_at: '2025-08-01T00:00:00Z',
    date_from: '2025-08-01',
    date_to: '2025-08-03',
    pets: [{ type: 'cat', name: 'Mia' }],
    final_amount: 45,
    ...overrides
  };
}

async function seedBookings(page, bookings) {
  await page.evaluate((bookings) => {
    const el = document.querySelector('[x-data="accountApp()"]');
    const data = window.Alpine.$data(el);
    data.session = { user: { email: 'client@example.com' } };
    data.loadingList = false;
    data.bookings = bookings;
  }, bookings);
}

Given('I am logged in on my bookings page', async ({ page }) => {
  await page.goto('/account.html');
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
  await page.waitForFunction(
    () => window.Alpine && document.querySelector('[x-data="accountApp()"]')
  );
  // Start from a logged-in, empty list so the bookings section is rendered.
  await seedBookings(page, []);
  await expect(app(page).getByText('No bookings yet.')).toBeVisible();
});

When(
  'my bookings include an approved booking with the Tikkie link {string}',
  async ({ page }, url) => {
    await seedBookings(page, [makeBooking({ status: 'approved', tikkie_url: url })]);
  }
);

When('my bookings include an approved booking with no Tikkie link', async ({ page }) => {
  await seedBookings(page, [makeBooking({ status: 'approved', tikkie_url: null })]);
});

When(
  'my bookings include a pending booking with the Tikkie link {string}',
  async ({ page }, url) => {
    await seedBookings(page, [
      makeBooking({ status: 'pending', tikkie_sent: false, factuur_number: null, tikkie_url: url })
    ]);
  }
);

Then('I see a Pay with Tikkie button linking to {string}', async ({ page }, url) => {
  const link = payLink(page);
  await expect(link).toBeVisible();
  expect(await link.getAttribute('href')).toBe(url);
});

Then('I do not see a Pay with Tikkie button', async ({ page }) => {
  await expect(payLink(page)).toHaveCount(0);
});
