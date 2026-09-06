// Step definitions for tests/bdd/features/client-list.feature.
// Pure logic test: imports static/js/facturen/client-list.js directly (no
// DOM, no browser), same style as booking-sort.steps.mjs.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { clientStatus, filterClients, sortClients, paginate } from '../../../static/js/facturen/client-list.js';

const { Given, When, Then } = createBdd();

function makeClient(overrides) {
  return {
    id: overrides.name,
    name: '',
    email: '',
    phone: null,
    invited_at: null,
    accepted_at: null,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides
  };
}

Given('a client with invited_at {string} and accepted_at {string}', async ({}, invitedAt, acceptedAt) => {
  world.client = makeClient({ invited_at: invitedAt || null, accepted_at: acceptedAt || null });
});

When("the client's status is derived", async () => {
  world.status = clientStatus(world.client);
});

Then('the status is {string}', async ({}, expected) => {
  if (world.status !== expected) {
    throw new Error(`Expected status "${expected}" but got "${world.status}"`);
  }
});

Given('a roster of clients:', async ({}, dataTable) => {
  world.roster = dataTable.hashes().map((row) => makeClient(row));
});

Given('a roster of {int} clients', async ({}, count) => {
  world.roster = Array.from({ length: count }, (_, i) =>
    makeClient({ name: 'Client ' + i, email: `client${i}@example.com` })
  );
});

When('the roster is filtered with search {string} and status {string}', async ({}, search, status) => {
  world.filtered = filterClients(world.roster, { search, status });
});

Then('the filtered roster contains only {string}', async ({}, expectedName) => {
  const names = world.filtered.map((c) => c.name);
  if (names.length !== 1 || names[0] !== expectedName) {
    throw new Error(`Expected only "${expectedName}" but got [${names.join(', ')}]`);
  }
});

When('the roster is sorted by {string} in {string} order', async ({}, field, direction) => {
  world.sorted = sortClients(world.roster, field, direction);
});

Then('the sorted roster names are {string}', async ({}, expected) => {
  const actual = world.sorted.map((c) => c.name).join(', ');
  if (actual !== expected) {
    throw new Error(`Expected order "${expected}" but got "${actual}"`);
  }
});

When('the roster is paginated at page {int} with page size {int}', async ({}, page, pageSize) => {
  world.paginated = paginate(world.roster, page, pageSize);
});

Then('the page has {int} items', async ({}, expected) => {
  if (world.paginated.items.length !== expected) {
    throw new Error(`Expected ${expected} items but got ${world.paginated.items.length}`);
  }
});

Then('the page number is {int}', async ({}, expected) => {
  if (world.paginated.page !== expected) {
    throw new Error(`Expected page ${expected} but got ${world.paginated.page}`);
  }
});

Then('there are {int} total pages', async ({}, expected) => {
  if (world.paginated.totalPages !== expected) {
    throw new Error(`Expected ${expected} total pages but got ${world.paginated.totalPages}`);
  }
});
