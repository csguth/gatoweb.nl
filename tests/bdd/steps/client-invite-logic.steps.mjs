// Step definitions for tests/bdd/features/client-invite-logic.feature.
// Pure logic test: imports supabase/functions/client-invite/logic.js directly
// (no Deno, no network), same style as gcal-sync-*.steps.mjs / payment-url.steps.mjs.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { isValidClientEmail, buildInviteRedirectTo } from '../../../supabase/functions/client-invite/logic.js';

const { Given, When, Then } = createBdd();

Given('a client email {string}', async ({}, email) => {
  world.clientEmail = email;
});

When('the client email is validated', async () => {
  world.clientEmailValid = isValidClientEmail(world.clientEmail);
});

Then('the client email is valid', async () => {
  if (world.clientEmailValid !== true) {
    throw new Error(`Expected "${world.clientEmail}" to be a valid email but it was rejected`);
  }
});

Then('the client email is invalid', async () => {
  if (world.clientEmailValid !== false) {
    throw new Error(`Expected "${world.clientEmail}" to be an invalid email but it was accepted`);
  }
});

Given('the site URL is {string}', async ({}, url) => {
  world.siteUrl = url;
});

Given('the client\'s preferred language is {string}', async ({}, lang) => {
  world.preferredLang = lang;
});

When('the invite redirect is built', async () => {
  world.inviteRedirect = buildInviteRedirectTo(world.siteUrl, world.preferredLang);
});

Then('the invite redirect URL is {string}', async ({}, expected) => {
  if (world.inviteRedirect !== expected) {
    throw new Error(`Expected redirect "${expected}" but got "${world.inviteRedirect}"`);
  }
});
