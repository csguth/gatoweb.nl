// Step definitions for tests/bdd/features/i18n.feature (js/lang-toggle.js).
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

Given('I open the site with browser language {string} and no saved preference', async ({ page }, _locale) => {
  // Each Playwright test already gets a fresh browser context (no leftover
  // localStorage), so a plain goto is enough. An addInitScript here would be
  // wrong: it re-runs on every navigation, including the "reload" scenario's
  // page.reload(), which would wipe out the just-saved `gatoweb_lang` choice.
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
});

When('I switch the language to {string}', async ({ page }, lang) => {
  await page.getByLabel('Switch language').selectOption(lang);
  // The i18n runtime applies the resolved language (incl. body classes)
  // asynchronously after i18next.changeLanguage() resolves.
  await page.waitForFunction(
    (expected) => document.body.classList.contains('show-nl') === (expected === 'nl'),
    lang
  );
});

When('I reload the page', async ({ page }) => {
  await page.reload();
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
});

Then('the nav shows {string} and hides {string}', async ({ page }, shownText, hiddenText) => {
  // i18n-static.js overwrites BOTH the `.en` and `.nl` sibling spans with the
  // same (current-language) text — only one of the pair is actually visible
  // via CSS (`body.show-nl`/`.show-pt`) — so matching by text alone can find
  // a same-text-but-hidden element. Assert on real visibility instead.
  await expect
    .poll(() => isAnyVisibleWithExactText(page, shownText))
    .toBe(true);
  await expect
    .poll(() => isAnyVisibleWithExactText(page, hiddenText))
    .toBe(false);
});

// Same assertion as "the nav shows ..." above, phrased generically for
// content that lives outside the nav (e.g. the About section bio).
Then('the page shows {string} and hides {string}', async ({ page }, shownText, hiddenText) => {
  await expect
    .poll(() => isAnyVisibleWithExactText(page, shownText))
    .toBe(true);
  await expect
    .poll(() => isAnyVisibleWithExactText(page, hiddenText))
    .toBe(false);
});

function isAnyVisibleWithExactText(page, text) {
  return page.evaluate((expected) => {
    const candidates = Array.from(document.querySelectorAll('.en, .nl, .pt'));
    return candidates.some(
      (el) => el.textContent.trim() === expected && el.offsetParent !== null
    );
  }, text);
}
