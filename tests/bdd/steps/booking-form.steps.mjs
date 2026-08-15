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
  // The 2nd `input[type=text]` in the form is Address (1st is the full-name
  // field, required since issue #107) — there's no `for`/`id` label
  // association to hook into with getByLabel, so we rely on this stable DOM
  // position instead.
  await form(page).locator('input[type="text"]').nth(1).fill(address);
});

Given('I fill in the name as {string}', async ({ page }, name) => {
  await form(page).locator('input[type="text"]').nth(0).fill(name);
});

Given('I fill in the phone as {string}', async ({ page }, phone) => {
  await form(page).locator('input[type="tel"]').fill(phone);
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

When('I click {string} without filling in a name', async ({ page }, buttonText) => {
  await clickSendAndCaptureAlert(page, buttonText);
});

When('I click {string} without filling in a phone number', async ({ page }, buttonText) => {
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

Then('I see an alert asking for the name', async () => {
  expect(world.alertMessage).toBe('Please enter your full name');
});

Then('I see an alert asking for the phone number', async () => {
  expect(world.alertMessage).toBe('Please enter your WhatsApp number or phone');
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
  // The estimate is now rendered directly in the form (issue #43), computed via
  // buildInvoiceLineItems() (js/facturen/invoice-calc.js) — the same logic used for
  // the final factuur — so this reads the visible text instead of duplicating the
  // pricing math in the test.
  const text = await page.locator('#estimated-price-value').innerText();
  expect(text).toBe(`€ ${expected.toFixed(2)}`);
});

Then('the estimated price is not shown', async ({ page }) => {
  await expect(page.locator('#estimated-price-value')).toBeHidden();
});

Then('I see the login or signup gate instead of a sent confirmation', async ({ page }) => {
  await expect(form(page).getByRole('button', { name: 'Log in & send' })).toBeVisible();
});

// Issue #95: simulates a booking left pending because signup required email confirmation
// (see authSignup() in js/index/booking-form.js) — stashed under the dedicated
// 'gatoweb_pending_booking' localStorage key (separate from the regular draft, which
// excludes dates) before the client ever gets a session.
Given('a booking is pending confirmation with the first day {string} and the last day {string}', async ({ page }, from, to) => {
  await page.evaluate(({ from, to }) => {
    localStorage.setItem('gatoweb_pending_booking', JSON.stringify({
      clientName: 'Jane Doe',
      address: "Kerkstraat 1, 's-Hertogenbosch",
      clientContact: '+31 6 11111111',
      from,
      to,
      pets: [{ name: '', type: 'cat', otherType: '' }],
      pref: 'morning'
    }));
  }, { from, to });
});

// Mimics the post-email-confirmation redirect: Supabase's detectSessionInUrl normally
// parses session tokens from the URL fragment and persists them under the
// 'gatoweb-client-auth' storage key (see js/index/client-auth.js) — seeding that key
// directly and reloading has the same effect for supabase-js's getSession(), which only
// reads localStorage (no network call), without depending on a real Supabase project.
When('I return to the site already logged in as {string} after confirming my email', async ({ page }, email) => {
  await page.evaluate((email) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem('gatoweb-client-auth', JSON.stringify({
      access_token: 'fake.access.token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: now + 3600 * 24 * 365,
      refresh_token: 'fake-refresh-token',
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        aud: 'authenticated',
        role: 'authenticated',
        email,
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString()
      }
    }));
  }, email);
  await page.reload();
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
});

Then('I see the welcome-back note about the resumed booking', async ({ page }) => {
  await expect(form(page).getByText('Welcome back! The booking you started before confirming your email was just sent.')).toBeVisible();
});
