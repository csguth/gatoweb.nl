// Step definitions for tests/bdd/features/activate-page.feature
// (layouts/activate/list.html + js/activate/activate-app.js, issue #173
// follow-up).
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd();

function app(page) {
  return page.locator('[data-x-data="activateApp()"]');
}

Given('I visit the activate page without a verify link', async ({ page }) => {
  await page.goto('/en/activate/');
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
});

Then('I see the message {string}', async ({ page }, text) => {
  await expect(app(page).getByText(text, { exact: true })).toBeVisible();
});

Then('I do not see the raw key {string}', async ({ page }, key) => {
  await expect(app(page).getByText(key, { exact: true })).toHaveCount(0);
});
