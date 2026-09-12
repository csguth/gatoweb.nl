// Step definitions for tests/bdd/features/client-list.feature.
// Pure logic test: imports static/js/facturen/client-list.js directly (no
// DOM, no browser), same style as booking-sort.steps.mjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { clientStatus, filterClients, sortClients, paginate, deriveClientRoster } from '../../../static/js/facturen/client-list.js';


function makeClient(overrides) {
  return {
    id: overrides.name,
    name: '',
    phone: null,
    invited_at: null,
    accepted_at: null,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides
  };
}

Given('a client with invited_at {string} and accepted_at {string}', async (invitedAt, acceptedAt) => {
  world.client = makeClient({ invited_at: invitedAt || null, accepted_at: acceptedAt || null });
});

When("the client's status is derived", async () => {
  world.status = clientStatus(world.client);
});

Then('the status is {string}', async (expected) => {
  if (world.status !== expected) {
    throw new Error(`Expected status "${expected}" but got "${world.status}"`);
  }
});

Given('a roster of clients:', async (dataTable) => {
  world.roster = dataTable.hashes().map((row) => makeClient(row));
});

Given('a roster of {int} clients', async (count) => {
  world.roster = Array.from({ length: count }, (_, i) =>
    makeClient({ name: 'Client ' + i })
  );
});

When('the roster is filtered with search {string} and status {string}', async (search, status) => {
  world.filtered = filterClients(world.roster, { search, status });
});

Then('the filtered roster contains only {string}', async (expectedName) => {
  const names = world.filtered.map((c) => c.name);
  if (names.length !== 1 || names[0] !== expectedName) {
    throw new Error(`Expected only "${expectedName}" but got [${names.join(', ')}]`);
  }
});

When('the roster is sorted by {string} in {string} order', async (field, direction) => {
  world.sorted = sortClients(world.roster, field, direction);
});

Then('the sorted roster names are {string}', async (expected) => {
  const actual = world.sorted.map((c) => c.name).join(', ');
  if (actual !== expected) {
    throw new Error(`Expected order "${expected}" but got "${actual}"`);
  }
});

When('the roster is paginated at page {int} with page size {int}', async (page, pageSize) => {
  world.paginated = paginate(world.roster, page, pageSize);
});

Then('the page has {int} items', async (expected) => {
  if (world.paginated.items.length !== expected) {
    throw new Error(`Expected ${expected} items but got ${world.paginated.items.length}`);
  }
});

Then('the page number is {int}', async (expected) => {
  if (world.paginated.page !== expected) {
    throw new Error(`Expected page ${expected} but got ${world.paginated.page}`);
  }
});

Then('there are {int} total pages', async (expected) => {
  if (world.paginated.totalPages !== expected) {
    throw new Error(`Expected ${expected} total pages but got ${world.paginated.totalPages}`);
  }
});

Given('a Profile {string} with id {string}', async (name, id) => {
  world.rawClients = world.rawClients || [];
  world.rawClients.push({ id, name, created_at: '2025-01-01T00:00:00Z' });
});

Given('an invite for client {string} created at {string}', async (clientId, createdAt) => {
  world.rawInvites = world.rawInvites || [];
  world.rawInvites.push({ client_id: clientId, created_at: createdAt });
});

Given('a later invite for client {string} created at {string}', async (clientId, createdAt) => {
  world.rawInvites = world.rawInvites || [];
  world.rawInvites.push({ client_id: clientId, created_at: createdAt });
});

Given('an account link for client {string} linked at {string}', async (clientId, linkedAt) => {
  world.rawLinks = world.rawLinks || [];
  world.rawLinks.push({ client_id: clientId, linked_at: linkedAt });
});

When('the roster is derived from those rows', async () => {
  world.derivedRoster = deriveClientRoster(world.rawClients, world.rawInvites, world.rawLinks);
});

Then('client {string} has invited_at {string} and accepted_at {string}', async (clientId, invitedAt, acceptedAt) => {
  const client = world.derivedRoster.find((c) => c.id === clientId);
  if (!client) throw new Error(`Client ${clientId} not found in derived roster`);
  const actualInvited = client.invited_at || '';
  const actualAccepted = client.accepted_at || '';
  if (actualInvited !== invitedAt || actualAccepted !== acceptedAt) {
    throw new Error(`Expected invited_at="${invitedAt}" accepted_at="${acceptedAt}" but got invited_at="${actualInvited}" accepted_at="${actualAccepted}"`);
  }
});
