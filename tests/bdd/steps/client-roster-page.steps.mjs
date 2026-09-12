// Step definitions for tests/bdd/features/client-roster-page.feature
// (layouts/clients/list.html + js/facturen/clients-app.js, issue
// #173 follow-up). Runs against the "production-auth" fixture via
// @auth-required, same approach as account-tikkie.steps.mjs: no real
// backend — a fake session and client roster are seeded straight into
// clientsApp()'s Alpine state via the Alpine.$data() bridge, then
// assertions run on the rendered page (table, search, filter, sort,
// pagination).
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

function app(page) {
  return page.locator('[data-x-data="clientsApp()"]');
}

function makeClient(overrides) {
  return {
    id: overrides.name || 'test-client',
    name: 'Jane Doe',
    pets: [],
    phone: null,
    address: null,
    preferred_lang: 'en',
    invited_at: null,
    accepted_at: null,
    created_at: '2025-01-01T00:00:00Z',
    _inviteLink: '',
    _inviteBusy: false,
    ...overrides
  };
}

async function seedClients(page, clients) {
  await page.evaluate((clients) => {
    const el = document.querySelector('[data-x-data="clientsApp()"]');
    const data = window.Alpine.$data(el);
    data.session = { user: { email: 'ligia@example.com' } };
    data.loadingClients = false;
    data.clients = clients;
  }, clients);
}

async function currentClients(page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-x-data="clientsApp()"]');
    return window.Alpine.$data(el).clients;
  });
}

Given('I am logged in on the clients page', async ({ page }) => {
  await page.goto('/en/clients/');
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
  await page.waitForFunction(
    () => window.Alpine && document.querySelector('[data-x-data="clientsApp()"]')
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

Given('my client roster also includes {string} who already logged in', async ({ page }, name) => {
  const existing = await currentClients(page);
  await seedClients(page, [
    ...existing,
    makeClient({ name, invited_at: '2025-08-01T00:00:00Z', accepted_at: '2025-08-02T00:00:00Z' })
  ]);
});

When('a fresh invite link {string} is generated', async ({ page }, link) => {
  await page.evaluate((link) => {
    const el = document.querySelector('[data-x-data="clientsApp()"]');
    const data = window.Alpine.$data(el);
    data.clients[0]._inviteLink = link;
  }, link);
});

Given('my client roster includes clients named {string} and {string}', async ({ page }, name1, name2) => {
  await seedClients(page, [
    makeClient({ name: name1 }),
    makeClient({ name: name2 })
  ]);
});

Given('my client roster has {int} clients', async ({ page }, count) => {
  const clients = Array.from({ length: count }, (_, i) =>
    makeClient({ name: 'Client ' + i, created_at: `2025-01-${String(i + 1).padStart(2, '0')}T00:00:00Z` })
  );
  await seedClients(page, clients);
});

When('I search the roster for {string}', async ({ page }, term) => {
  await app(page).getByLabel('Search clients').fill(term);
});

When('I filter the roster by status {string}', async ({ page }, statusLabel) => {
  await app(page).getByLabel('Filter by status').selectOption({ label: statusLabel });
});

When('I click the {string} column header', async ({ page }, columnName) => {
  await app(page).getByRole('columnheader', { name: new RegExp(columnName) }).click();
});

When('I click the pagination button {string}', async ({ page }, buttonLabel) => {
  await app(page).getByRole('button', { name: new RegExp(buttonLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
});

Then('I see the {string} status', async ({ page }, status) => {
  await expect(app(page).locator('tbody').getByText(status, { exact: true })).toBeVisible();
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

Then('I see the client row {string}', async ({ page }, name) => {
  await expect(app(page).getByRole('cell', { name, exact: true })).toBeVisible();
});

Then('I do not see the client row {string}', async ({ page }, name) => {
  await expect(app(page).getByRole('cell', { name, exact: true })).toHaveCount(0);
});

Then('{string} appears before {string} in the roster', async ({ page }, first, second) => {
  const names = await app(page).locator('tbody tr td:first-child').allTextContents();
  const firstIdx = names.indexOf(first);
  const secondIdx = names.indexOf(second);
  expect(firstIdx).toBeGreaterThanOrEqual(0);
  expect(secondIdx).toBeGreaterThanOrEqual(0);
  expect(firstIdx).toBeLessThan(secondIdx);
});

Then('the page indicator shows {string}', async ({ page }, text) => {
  await expect(app(page).getByText(text, { exact: true })).toBeVisible();
});
