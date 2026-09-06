// Step definitions for tests/bdd/features/client-invite-logic.feature.
// Pure logic test: imports supabase/functions/client-invite/logic.js directly
// (no Deno, no network), same style as gcal-sync-*.steps.mjs / payment-url.steps.mjs.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { isValidClientEmail, buildInviteRedirectTo, isEmailExistsError } from '../../../supabase/functions/client-invite/logic.js';

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

Given('GoTrue responded to the invite attempt with the body {string}', async ({}, body) => {
  // Examples table cells can't contain literal double quotes without
  // breaking the surrounding "<response>" step text, so JSON bodies are
  // written with single quotes here and normalized to real JSON before
  // being handed to isEmailExistsError().
  world.goTrueBody = body.replace(/'/g, '"');
});

When('the response is checked for an {string} error', async ({}, _label) => {
  world.emailExistsDetected = isEmailExistsError(world.goTrueBody);
});

Then('the error is detected', async () => {
  if (world.emailExistsDetected !== true) {
    throw new Error('Expected the email_exists error to be detected but it was not');
  }
});

Then('the error is not detected', async () => {
  if (world.emailExistsDetected !== false) {
    throw new Error('Expected the email_exists error to NOT be detected but it was');
  }
});
