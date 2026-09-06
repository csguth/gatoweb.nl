// Step definitions for tests/bdd/features/i18n.feature.
//
// i18n is now resolved at build time: each language is a separate, fully-rendered page
// under its own URL, so there is no in-page toggle to click and only ONE language is
// ever present in the DOM. The steps therefore navigate between URLs and assert on
// plain visible text, instead of poking at .en/.nl sibling spans.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

Given('my browser language is {string} and I have no saved language preference', async ({ page }, locale) => {
  // Playwright's context-level `locale` can't be changed mid-test, so override the
  // navigator properties js/root-redirect.js actually reads. addInitScript runs before
  // any page script on every navigation, which is exactly when the redirect runs.
  // It deliberately touches no storage, so the saved-preference scenarios still work.
  await page.addInitScript((lang) => {
    Object.defineProperty(navigator, 'languages', { get: () => [lang], configurable: true });
    Object.defineProperty(navigator, 'language', { get: () => lang, configurable: true });
  }, locale);
  // A fresh Playwright context starts with empty storage, so "no saved preference"
  // needs no extra setup.
});

Given('I open the site at {string}', async ({ page }, urlPath) => {
  await page.goto(urlPath);
  await expect(page.locator('body')).toBeVisible();
});

When('I open the root', async ({ page }) => {
  await page.goto('/');
  // The root is a redirect stub: wait until the language page has taken over.
  await page.waitForURL(/\/(en|nl|pt)\/$/);
});

When('I open the root with {string}', async ({ page }, suffix) => {
  await page.goto('/' + suffix);
  await page.waitForURL(/\/(en|nl|pt)\//);
});

Then('the current fragment is {string}', async ({ page }, expected) => {
  expect(new URL(page.url()).hash).toBe(expected);
});

Then('the current query string is {string}', async ({ page }, expected) => {
  expect(new URL(page.url()).search).toBe(expected);
});

When('I follow the language selector link for {string}', async ({ page }, lang) => {
  // The selector is a footer dropdown (issue #154), so it has to be opened first.
  await page.locator('footer .lang-switcher-btn').click();
  await page.locator(`.lang-switcher-menu a[hreflang="${lang}"]`).click();
  await page.waitForURL(new RegExp(`/${lang}/$`));
});

When('I open the language selector', async ({ page }) => {
  await page.locator('footer .lang-switcher-btn').click();
});

When('I press Escape', async ({ page }) => {
  await page.keyboard.press('Escape');
});

Then('the language menu is visible', async ({ page }) => {
  await expect(page.locator('.lang-switcher-menu')).toBeVisible();
});

Then('the language menu is hidden', async ({ page }) => {
  await expect(page.locator('.lang-switcher-menu')).toBeHidden();
});

Then('the language menu lists {string}', async ({ page }, name) => {
  await expect(page.locator('.lang-switcher-menu [role="option"]', { hasText: name })).toBeVisible();
});

Then('the current path is {string}', async ({ page }, expectedPath) => {
  expect(new URL(page.url()).pathname).toBe(expectedPath);
});

Then('the page language is {string}', async ({ page }, lang) => {
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
});

Then('the page shows {string}', async ({ page }, text) => {
  await expect.poll(() => countVisibleWithExactText(page, text)).toBeGreaterThan(0);
});

Then('the page does not show {string}', async ({ page }, text) => {
  await expect.poll(() => countVisibleWithExactText(page, text)).toBe(0);
});

// Counts elements whose own trimmed text is exactly `expected` and that are actually
// rendered. Exact matching keeps "/day" from matching a longer sentence containing it.
function countVisibleWithExactText(page, expected) {
  return page.evaluate((wanted) => {
    const all = Array.from(document.querySelectorAll('body *'));
    return all.filter((el) => el.textContent.trim() === wanted && el.offsetParent !== null).length;
  }, expected);
}
