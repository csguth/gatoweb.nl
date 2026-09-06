// Step definitions for tests/bdd/features/client-invite-staff.feature
// (layouts/facturen/list.html + js/facturen/facturen-app.js, issue #173,
// MVP). Runs against the "production-auth" fixture via @auth-required, same
// approach as account-tikkie.steps.mjs: no real backend — a fake session and
// client roster are seeded straight into facturenApp()'s Alpine state via the
// Alpine.$data() bridge, then assertions run on the rendered panel.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

function app(page) {
  return page.locator('[data-x-data="facturenApp()"]');
}

function makeClient(overrides) {
  return {
    id: 'test-client-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: null,
    address: null,
    preferred_lang: 'en',
    invited_at: null,
    accepted_at: null,
    _inviteLink: '',
    _inviteBusy: false,
    ...overrides
  };
}

async function seedClients(page, clients) {
  await page.evaluate((clients) => {
    const el = document.querySelector('[data-x-data="facturenApp()"]');
    const data = window.Alpine.$data(el);
    data.session = { user: { email: 'ligia@example.com' } };
    data.bookings = [];
    data.loadingList = false;
    data.clientsPanelOpen = true;
    data.loadingClients = false;
    data.clients = clients;
  }, clients);
}

Given('I am logged in on the facturen dashboard', async ({ page }) => {
  await page.goto('/en/facturen/');
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
  await page.waitForFunction(
    () => window.Alpine && document.querySelector('[data-x-data="facturenApp()"]')
  );
  await seedClients(page, []);
});

When('my client roster includes {string} who hasn\'t been invited yet', async ({ page }, name) => {
  await seedClients(page, [makeClient({ name, invited_at: null, accepted_at: null })]);
});

Given(
  'my client roster includes {string} with phone {string} who hasn\'t been invited yet',
  async ({ page }, name, phone) => {
    await seedClients(page, [makeClient({ name, phone, invited_at: null, accepted_at: null })]);
  }
);

When('my client roster includes {string} who was invited but hasn\'t logged in', async ({ page }, name) => {
  await seedClients(page, [makeClient({ name, invited_at: '2025-08-01T00:00:00Z', accepted_at: null })]);
});

When('my client roster includes {string} who already logged in', async ({ page }, name) => {
  await seedClients(page, [
    makeClient({ name, invited_at: '2025-08-01T00:00:00Z', accepted_at: '2025-08-02T00:00:00Z' })
  ]);
});

When('a fresh invite link {string} is generated', async ({ page }, link) => {
  await page.evaluate((link) => {
    const el = document.querySelector('[data-x-data="facturenApp()"]');
    const data = window.Alpine.$data(el);
    data.clients[0]._inviteLink = link;
  }, link);
});

Then('I see the {string} status', async ({ page }, status) => {
  await expect(app(page).getByText(status, { exact: true })).toBeVisible();
});

Then('I see a {string} button', async ({ page }, label) => {
  await expect(app(page).getByRole('button', { name: new RegExp(label) })).toBeVisible();
});

Then('I do not see a {string} button', async ({ page }, label) => {
  await expect(app(page).getByRole('button', { name: new RegExp(label) })).toHaveCount(0);
});

Then('I see a {string} link pointing to WhatsApp number {string}', async ({ page }, label, number) => {
  const link = app(page).getByRole('link', { name: new RegExp(label) });
  await expect(link).toBeVisible();
  const href = await link.getAttribute('href');
  expect(href).toContain('https://wa.me/' + number);
});
