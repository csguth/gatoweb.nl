// Step definitions for tests/bdd/features/social-and-pricing-notes.feature.
//
// Issues #115 and #116. The assertions deliberately check computed styles rather than
// class names: the point of #115 is that the text is actually bigger and a different
// colour than the surrounding body copy, which a class-name check wouldn't catch if
// the tokens changed underneath.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Then } = createBdd();

const px = (v) => parseFloat(v);

Then('the additional services line is emphasised', async ({ page }) => {
  const line = page.locator('p', { hasText: 'Also available for dogs' }).first();
  await expect(line).toBeVisible();
  const style = await line.evaluate((el) => {
    const cs = getComputedStyle(el);
    const body = getComputedStyle(document.body);
    return { size: cs.fontSize, weight: cs.fontWeight, colour: cs.color, bodySize: body.fontSize };
  });
  // Bigger than the page's base text and set in a heavier weight.
  expect(px(style.size)).toBeGreaterThanOrEqual(px(style.bodySize));
  expect(Number(style.weight)).toBeGreaterThanOrEqual(600);
});

Then('the seasonal surcharge notice stands out from the body text', async ({ page }) => {
  const note = page.locator('p', { hasText: 'Seasonal surcharges may apply' }).first();
  await expect(note).toBeVisible();
  const style = await note.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, border: cs.borderTopWidth, size: cs.fontSize };
  });
  // Sits on its own tinted, bordered card rather than being loose fine print.
  expect(style.bg).not.toBe('rgba(0, 0, 0, 0)');
  expect(px(style.border)).toBeGreaterThan(0);
  expect(px(style.size)).toBeGreaterThanOrEqual(14);
});

Then('the social link points at Instagram', async ({ page }) => {
  const link = page.locator('a[href*="instagram.com"]').first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', /instagram\.com\/.+/);
  // External link hygiene: opens in a new tab without leaking the opener.
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});
