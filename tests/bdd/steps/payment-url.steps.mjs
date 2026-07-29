// Step definitions for tests/bdd/features/payment-url.feature.
// Pure logic test: imports js/facturen/payment-url.js directly (no DOM, no
// browser needed), matching that module's own "no i18n/DOM/Alpine" design and
// the same style as invoice-calc.steps.mjs.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { isValidPaymentUrl } from '../../../js/facturen/payment-url.js';

const { Given, When, Then } = createBdd();

Given('a Tikkie link {string}', async ({}, link) => {
  world.paymentLink = link;
});

When('the link is validated', async () => {
  world.paymentLinkValid = isValidPaymentUrl(world.paymentLink);
});

Then('the link is valid', async () => {
  if (world.paymentLinkValid !== true) {
    throw new Error(`Expected "${world.paymentLink}" to be valid but it was rejected`);
  }
});

Then('the link is invalid', async () => {
  if (world.paymentLinkValid !== false) {
    throw new Error(`Expected "${world.paymentLink}" to be invalid but it was accepted`);
  }
});
