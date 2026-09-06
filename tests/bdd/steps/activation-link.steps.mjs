// Step definitions for tests/bdd/features/activation-link.feature.
// Pure logic test: imports static/js/activate/activation-link.js directly
// (no DOM, no browser), same style as payment-url.steps.mjs.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { resolveActivationLink } from '../../../static/js/activate/activation-link.js';

const { Given, When, Then } = createBdd();

Given('the verify query parameter is {string}', async ({}, raw) => {
  world.rawVerifyParam = raw;
});

When('the activation link is resolved', async () => {
  world.resolvedActivationLink = resolveActivationLink(world.rawVerifyParam);
});

Then('the resolved activation link is {string}', async ({}, expected) => {
  const actual = world.resolvedActivationLink === null ? '(none)' : world.resolvedActivationLink;
  if (actual !== expected) {
    throw new Error(`Expected resolved link "${expected}" but got "${actual}"`);
  }
});
