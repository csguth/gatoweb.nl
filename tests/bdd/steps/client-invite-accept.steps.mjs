// Step definitions for tests/bdd/features/client-invite-accept.feature
// (layouts/account/list.html + js/account/account-app.js, issue #173, MVP).
// Runs against the "production-auth" fixture via @auth-required, same
// approach as account-tikkie.steps.mjs: no real backend — session/needsPassword
// state is seeded straight into accountApp()'s Alpine state via the
// Alpine.$data() bridge, and the "finish setting my password" steps simulate
// setPassword()'s successful outcome (updateUser + link_my_bookings both
// succeeded) without a real network round-trip.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

function app(page) {
  return page.locator('[data-x-data="accountApp()"]');
}

Given('I am logged in on my bookings page via an invite link', async ({ page }) => {
  await page.goto('/en/account/');
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
  await page.waitForFunction(
    () => window.Alpine && document.querySelector('[data-x-data="accountApp()"]')
  );
  await page.evaluate(() => {
    const el = document.querySelector('[data-x-data="accountApp()"]');
    const data = window.Alpine.$data(el);
    data.session = { user: { email: 'client@example.com' } };
    data.needsPassword = true;
  });
});

When('I finish setting my password', async ({ page }) => {
  await page.evaluate(() => {
    const el = document.querySelector('[data-x-data="accountApp()"]');
    const data = window.Alpine.$data(el);
    data.needsPassword = false;
    data.loadingList = false;
    data.bookings = [];
  });
});

When('I finish setting my password and {int} previous bookings are linked', async ({ page }, count) => {
  await page.evaluate((count) => {
    const el = document.querySelector('[data-x-data="accountApp()"]');
    const data = window.Alpine.$data(el);
    data.needsPassword = false;
    data.linkedBookingsCount = count;
    data.loadingList = false;
    data.bookings = [];
  }, count);
});

Then('I see the {string} prompt', async ({ page }, text) => {
  await expect(app(page).getByText(text)).toBeVisible();
});

Then('I do not see the {string} prompt', async ({ page }, text) => {
  await expect(app(page).getByText(text)).toHaveCount(0);
});

Then('I do not see {string}', async ({ page }, text) => {
  await expect(app(page).getByText(text)).toHaveCount(0);
});

Then('I see {string}', async ({ page }, text) => {
  await expect(app(page).getByText(text)).toBeVisible();
});

Then('I see a message that {int} previous bookings were linked', async ({ page }, count) => {
  await expect(app(page).getByText(new RegExp('linked ' + count + ' previous booking'))).toBeVisible();
});
