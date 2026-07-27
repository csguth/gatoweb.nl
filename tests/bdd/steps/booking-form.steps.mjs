// Step definitions for tests/bdd/features/booking-form.feature (index.html +
// js/index/booking-form.js). Runs against the built "production" fixture by
// default, and "production-auth" for the @auth-required scenario (see
// playwright.config.mjs projects).
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { world } from '../support/world.mjs';

const { Given, When, Then } = createBdd();

function form(page) {
  return page.locator('[x-data="bookingForm()"]');
}

Given('I open the booking form', async ({ page }) => {
  world.alertMessage = null;
  world.petIndex = 0;
  await page.goto('/');
  await expect(form(page)).toBeVisible();
  // Static markup renders immediately, but i18n JS strings (used by
  // t('booking.start_date_required') etc.) resolve asynchronously via
  // i18next — wait for that to finish so alerts/links use real text
  // instead of raw translation keys.
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
});

Given('I fill in the first day as {string}', async ({ page }, date) => {
  await form(page).locator('input[type="date"]').nth(0).fill(date);
});

Given('I fill in the first day as {string} and the last day as {string}', async ({ page }, from, to) => {
  await form(page).locator('input[type="date"]').nth(0).fill(from);
  await form(page).locator('input[type="date"]').nth(1).fill(to);
});

Given('I fill in the address as {string}', async ({ page }, address) => {
  // The 2nd `input[type=text]` in the form is Address (1st is the optional
  // client name field) — there's no `for`/`id` label association to hook
  // into with getByLabel, so we rely on this stable DOM position instead.
  await form(page).locator('input[type="text"]').nth(1).fill(address);
});

Given('I add a pet of type {string}', async ({ page }, type) => {
  const rows = form(page).locator('.space-y-3 > div.bg-white');
  if (world.petIndex > 0) {
    await form(page).getByRole('button', { name: /Add pet/ }).click();
  }
  const row = rows.nth(world.petIndex);
  const buttonName = type === 'dog' ? /Dogwalking/ : /Catsitting/;
  await row.getByRole('button', { name: buttonName }).click();
  world.petIndex += 1;
});

Given('I choose the {string} visit preference', async ({ page }, preference) => {
  const labels = { morning: /Morning/, evening: /Evening/, both: /Both/, none: /No pref\./ };
  await form(page).getByRole('button', { name: labels[preference] }).click();
});

When('I click {string} without filling in any dates', async ({ page }, buttonText) => {
  await clickSendAndCaptureAlert(page, buttonText);
});

When('I click {string} without filling in an address', async ({ page }, buttonText) => {
  await clickSendAndCaptureAlert(page, buttonText);
});

When('I click {string}', async ({ page }, buttonText) => {
  await clickSendAndCaptureAlert(page, buttonText);
});

async function clickSendAndCaptureAlert(page, buttonText) {
  page.once('dialog', async (dialog) => {
    world.alertMessage = dialog.message();
    await dialog.accept();
  });
  await form(page).getByRole('button', { name: buttonText }).click();
  // Give the (possible) dialog a moment to fire before the next step asserts on it.
  await page.waitForTimeout(100);
}

Then('I see an alert asking for the start date', async () => {
  expect(world.alertMessage).toBe('Please select a start date');
});

Then('I see an alert asking for the address', async () => {
  expect(world.alertMessage).toBe('Please enter your address (required for the invoice)');
});

Then('the booking is not marked as sent', async ({ page }) => {
  await expect(form(page).getByText('Booking request sent!')).toBeHidden();
});

Then('the booking is marked as sent', async ({ page }) => {
  await expect(form(page).getByText('Booking request sent!')).toBeVisible();
});

Then('the WhatsApp confirmation link includes the phone number {string}', async ({ page }, number) => {
  const href = await form(page).getByRole('link', { name: /Message Lígia on WhatsApp/ }).getAttribute('href');
  expect(href).toContain(`https://wa.me/${number}`);
});

Then('the WhatsApp confirmation link mentions {string}', async ({ page }, text) => {
  const href = await form(page).getByRole('link', { name: /Message Lígia on WhatsApp/ }).getAttribute('href');
  expect(decodeURIComponent(href)).toContain(text);
});

Then('the suggested price is €{float}', async ({ page }, expected) => {
  // _suggestedAmount() isn't rendered anywhere in the UI (only used
  // internally when persisting to Supabase), so this reaches into the
  // Alpine component's reactive state directly via Alpine.$data() — the
  // same bridge Alpine devtools use — rather than duplicating the pricing
  // logic in the test itself.
  const amount = await page.evaluate(() => {
    const el = document.querySelector('[x-data="bookingForm()"]');
    return window.Alpine.$data(el)._suggestedAmount();
  });
  expect(amount).toBe(expected);
});

Then('I see the login or signup gate instead of a sent confirmation', async ({ page }) => {
  await expect(form(page).getByRole('button', { name: 'Log in & send' })).toBeVisible();
});
