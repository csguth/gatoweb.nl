// Step definitions for tests/bdd/features/invoice-document.feature.
// Pure logic test: imports js/shared/invoice-document.js directly and drives it in
// Node by stubbing the two browser globals it depends on (window.GATOWEB_CONFIG for
// pricing/business info and window.i18next for the always-Dutch translations, loaded
// straight from locales/nl.json so the assertions use the real strings). No DOM or
// browser needed — this covers the proforma-vs-final branch added in issue #62.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { buildInvoiceDocumentHtml } from '../../../js/shared/invoice-document.js';

const { Given, When, Then } = createBdd();

const here = dirname(fileURLToPath(import.meta.url));
const nl = JSON.parse(readFileSync(join(here, '../../../locales/nl.json'), 'utf8'));

// Minimal i18next.getFixedT stand-in: walks the dotted key into the loaded nl bundle
// and interpolates {{placeholders}} from the options, mirroring how i18next resolves
// keys in the browser. Falls back to the key itself when missing (same as tNl()).
function translate(key, options) {
  const value = key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), nl);
  if (typeof value !== 'string') return key;
  return value.replace(/{{\s*([^}]+?)\s*}}/g, (_, name) => {
    const replacement = options && options[name];
    return replacement == null ? '' : String(replacement);
  });
}

Given('the Dutch invoice translations and business config are loaded', async () => {
  global.window = {
    GATOWEB_CONFIG: {
      PRICE_ONE_VISIT: 15,
      PRICE_TWO_VISITS: 25,
      DOG_WALK_PRICE_FROM: 10,
      SEASONAL_SURCHARGE_PERCENT: 20,
      BRAND_NAME: 'Gato Petsit',
      BUSINESS_LEGAL_NAME: 'Gato Petsit',
      BUSINESS_ADDRESS: 'Teststraat 1, Den Bosch',
      KVK_NUMBER: '12345678',
      IBAN_NUMBER: 'NL00BANK0123456789',
      BTW_EXEMPT: 'true'
    },
    i18next: {
      isInitialized: true,
      getFixedT: () => translate
    }
  };
});

Given('the booking is paid as factuur number {int} on {string}', async ({}, number, paidOn) => {
  world.booking = { ...world.booking, factuur_number: number, approved_at: paidOn, paid_at: paidOn };
});

When('the invoice document is built', async () => {
  world.document = buildInvoiceDocumentHtml(world.booking);
});

Then('the document title is {string}', async ({}, title) => {
  assertIncludes(world.document, '<title>' + title + '</title>', 'document <title>');
  assertIncludes(world.document, '<h1>' + title + '</h1>', 'document <h1>');
});

Then('the document shows the proforma notice', async () => {
  assertIncludes(world.document, '<div class="proforma-notice">', 'proforma notice');
});

Then('the document does not show the proforma notice', async () => {
  if (world.document.includes('<div class="proforma-notice">')) {
    throw new Error('Expected the document NOT to render the proforma notice, but it did');
  }
});

Then('the document total is €{float}', async ({}, total) => {
  assertIncludes(world.document, '€ ' + total.toFixed(2) + '</td></tr>', 'invoice total row');
});

function assertIncludes(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`Expected ${label} to contain ${JSON.stringify(needle)}`);
  }
}
