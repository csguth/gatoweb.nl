// Step definitions for tests/bdd/features/client-invite-actions.feature.
// Pure logic test: imports js/facturen/client-invite-actions.js directly (no
// DOM, no browser, no real Supabase client needed) — same pattern as
// invoice-calc.steps.mjs / gcal-sync-event.steps.mjs. Fake rpc/reset
// functions below drive every corner case (RPC error, empty data, Auth
// rejection) that a real Supabase backend could produce.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { world } from '../support/world.mjs';
import {
  generateInviteLink,
  sendPasswordReset,
  unlinkAccount
} from '../../../static/js/facturen/client-invite-actions.js';

const { Given, When, Then } = createBdd();

const GENERIC_ERROR = 'Could not generate the invite link. Please try again.';

function ok(data) {
  return { data, error: null };
}

function fail(message) {
  return { data: null, error: { message } };
}

Given('the create_client_invite RPC will return token {string}', async ({}, token) => {
  world.rpcResults = world.rpcResults || {};
  world.rpcResults.create_client_invite = ok(token);
});

Given('the create_client_invite RPC will fail with {string}', async ({}, message) => {
  world.rpcResults = world.rpcResults || {};
  world.rpcResults.create_client_invite = fail(message);
});

Given('the create_client_invite RPC will return no token', async () => {
  world.rpcResults = world.rpcResults || {};
  world.rpcResults.create_client_invite = ok(null);
});

Given('the get_linked_account_email RPC will return {string}', async ({}, email) => {
  world.rpcResults = world.rpcResults || {};
  world.rpcResults.get_linked_account_email = ok(email);
});

Given('the get_linked_account_email RPC will fail with {string}', async ({}, message) => {
  world.rpcResults = world.rpcResults || {};
  world.rpcResults.get_linked_account_email = fail(message);
});

Given('the get_linked_account_email RPC will return no email', async () => {
  world.rpcResults = world.rpcResults || {};
  world.rpcResults.get_linked_account_email = ok(null);
});

Given('the unlink_client_account RPC will return {word}', async ({}, boolWord) => {
  world.rpcResults = world.rpcResults || {};
  world.rpcResults.unlink_client_account = ok(boolWord === 'true');
});

Given('the unlink_client_account RPC will fail with {string}', async ({}, message) => {
  world.rpcResults = world.rpcResults || {};
  world.rpcResults.unlink_client_account = fail(message);
});

Given('resetPasswordForEmail will succeed', async () => {
  world.resetPasswordResult = { error: null };
});

Given('resetPasswordForEmail will fail with {string}', async ({}, message) => {
  world.resetPasswordResult = { error: { message } };
});

function fakeRpc() {
  return async (name) => world.rpcResults[name];
}

When('I generate an invite link for client {string} in {string} from {string}', async ({}, clientId, lang, origin) => {
  world.actionResult = await generateInviteLink({
    rpc: fakeRpc(),
    clientId,
    origin,
    lang,
    genericErrorMessage: GENERIC_ERROR
  });
});

When('I send a password reset for client {string} in {string} from {string}', async ({}, clientId, lang, origin) => {
  world.actionResult = await sendPasswordReset({
    rpc: fakeRpc(),
    resetPasswordForEmail: async () => world.resetPasswordResult,
    clientId,
    origin,
    lang,
    genericErrorMessage: GENERIC_ERROR
  });
});

When('I unlink the account for client {string}', async ({}, clientId) => {
  world.actionResult = await unlinkAccount({ rpc: fakeRpc(), clientId });
});

Then('the invite action succeeds', async () => {
  expect(world.actionResult.ok).toBe(true);
});

Then('the invite action fails with message {string}', async ({}, message) => {
  expect(world.actionResult.ok).toBe(false);
  expect(world.actionResult.message).toBe(message);
});

Then('the invite action fails with the generic invite error', async () => {
  expect(world.actionResult.ok).toBe(false);
  expect(world.actionResult.message).toBe(GENERIC_ERROR);
});

Then('the generated invite link is {string}', async ({}, link) => {
  expect(world.actionResult.link).toBe(link);
});

Then('the unlink result reports a link existed', async () => {
  expect(world.actionResult.hadLink).toBe(true);
});

Then('the unlink result reports no link existed', async () => {
  expect(world.actionResult.hadLink).toBe(false);
});
