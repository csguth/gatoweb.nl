// Step definitions for tests/bdd/features/internal-nav.feature.
//
// The account and facturen pages had no navigation at all (issue #98). These steps
// assert on layouts/partials/internal-nav.html: the logo links home, the account page
// adds a booking CTA, and every link stays inside the visitor's language.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Then } = createBdd();

const nav = (page) => page.locator('nav').filter({ has: page.locator('img[src*="logo"]') });

Then('the internal navigation links home to {string}', async ({ page }, href) => {
  const home = nav(page).locator(`a[href="${href}"]`).first();
  await expect(home).toBeVisible();
  // The logo itself is the home link, which is what makes it discoverable.
  await expect(home.locator('img[src*="logo"]')).toHaveCount(1);
});

Then('the internal navigation links to the booking form at {string}', async ({ page }, href) => {
  await expect(nav(page).locator(`a[href="${href}"]`)).toBeVisible();
});

Then('the internal navigation has no booking CTA', async ({ page }) => {
  await expect(nav(page).locator('a[href*="#booking"]')).toHaveCount(0);
});

Then('the internal navigation is labelled for assistive technology', async ({ page }) => {
  await expect(nav(page)).toHaveAttribute('aria-label', /.+/);
  // The logo is the home link, so its alt text is what a screen reader announces for
  // that link — it must not be empty.
  await expect(nav(page).locator('a img[src*="logo"]')).toHaveAttribute('alt', /.+/);
});
