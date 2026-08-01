// Step definitions for tests/bdd/features/staging-banner.feature (css/site.css
// #env-banner rules). Runs against both the "staging" and "production" fixture
// projects (see playwright.config.mjs) — untagged scenario -> production,
// @staging-env -> staging.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd();

Given('I open the site', async ({ page }) => {
  await page.goto('/');
});

Then('the {string} banner is visible', async ({ page }, _label) => {
  await expect(page.locator('#env-banner')).toBeVisible();
});

Then('the {string} banner is hidden', async ({ page }, _label) => {
  await expect(page.locator('#env-banner')).toBeHidden();
});
