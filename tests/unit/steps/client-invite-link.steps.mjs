// Step definitions for tests/bdd/features/client-invite-link.feature.
// Pure logic test: imports static/js/facturen/client-invite-link.js
// directly (no Deno, no network), same style as invoice-calc.steps.mjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { buildInviteLink } from '../../../static/js/facturen/client-invite-link.js';


Given('the site URL is {string}', async (url) => {
  world.siteUrl = url;
});

Given('the client\'s preferred language is {string}', async (lang) => {
  world.preferredLang = lang;
});

Given('a fresh invite token is {string}', async (token) => {
  world.inviteToken = token;
});

When('the invite link is built', async () => {
  world.inviteLink = buildInviteLink(world.siteUrl, world.preferredLang, world.inviteToken);
});

Then('the invite link is {string}', async (expected) => {
  if (world.inviteLink !== expected) {
    throw new Error(`Expected invite link "${expected}" but got "${world.inviteLink}"`);
  }
});
