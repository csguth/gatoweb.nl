// Step definitions for tests/bdd/features/brand-icons.feature — the brand icon set
// from Lígia's Canva design (issue #139) and the emojis it replaced.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd();

// Anything Unicode considers a pictograph: the emojis the UI used to carry. The
// typographic marks that stayed (★ ✓ ✕) are deliberately not in this class.
const EMOJI = /\p{Extended_Pictographic}/u;

const form = (page) => page.locator('[data-x-data="bookingForm()"]');
const brandIcons = (scope) => scope.locator('img[src^="/images/icons/"]');

function preferenceOptions(page) {
  return [/Morning/, /Evening/, /Both/, /No pref\./].map((name) =>
    form(page).getByRole('button', { name })
  );
}

Given('I open the home page', async ({ page }) => {
  await page.goto('/en/');
  await expect(form(page)).toBeVisible();
});

Then('each {string} option shows a brand icon', async ({ page }, group) => {
  expect(group).toBe('Visit preference');
  for (const option of preferenceOptions(page)) {
    await expect(brandIcons(option).first()).toBeAttached();
  }
});

Then('the booking form contains no emoji', async ({ page }) => {
  const text = await form(page).innerText();
  expect(text).not.toMatch(EMOJI);
});

Then('the {string} option shows the {string} icon', async ({ page }, label, icon) => {
  const option = form(page).getByRole('button', { name: label });
  await expect(option.locator(`img[src="/images/icons/${icon}.svg"]`)).toBeAttached();
});

Then('every brand icon on the page is hidden from assistive technology', async ({ page }) => {
  const icons = brandIcons(page);
  const count = await icons.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const icon = icons.nth(i);
    expect(await icon.getAttribute('alt')).toBe('');
    expect(await icon.getAttribute('aria-hidden')).toBe('true');
  }
});

Then('the visit preference options are still announced by their labels', async ({ page }) => {
  for (const option of preferenceOptions(page)) {
    await expect(option).toBeVisible();
  }
});
