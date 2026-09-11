// Step definitions for tests/bdd/features/client-invite-link.feature.
// Pure logic test: imports static/js/facturen/client-invite-link.js
// directly (no Deno, no network), same style as invoice-calc.steps.mjs.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { buildInviteLink } from '../../../static/js/facturen/client-invite-link.js';

const { Given, When, Then } = createBdd();

Given('the site URL is {string}', async ({}, url) => {
  world.siteUrl = url;
});

Given('the client\'s preferred language is {string}', async ({}, lang) => {
  world.preferredLang = lang;
});

Given('a fresh invite token is {string}', async ({}, token) => {
  world.inviteToken = token;
});

When('the invite link is built', async () => {
  world.inviteLink = buildInviteLink(world.siteUrl, world.preferredLang, world.inviteToken);
});

Then('the invite link is {string}', async ({}, expected) => {
  if (world.inviteLink !== expected) {
    throw new Error(`Expected invite link "${expected}" but got "${world.inviteLink}"`);
  }
});
