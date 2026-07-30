// Step definitions for tests/bdd/features/invoice-calc.feature.
// Pure logic test: imports js/facturen/invoice-calc.js directly (no DOM, no
// browser needed), matching that module's own "no i18n/DOM/Alpine" design.
import { createBdd } from 'playwright-bdd';
import { world } from '../support/world.mjs';
import { buildInvoiceLineItems } from '../../../js/facturen/invoice-calc.js';

const { Given, When, Then } = createBdd();

Given(
  'the price rates are one-visit €{float}, two-visits €{float}, dog-walk €{float}, seasonal surcharge {int}%',
  async ({}, oneVisit, twoVisits, dogWalk, surchargePercent) => {
    world.rates = {
      priceOneVisit: oneVisit,
      priceTwoVisits: twoVisits,
      dogWalkPriceFrom: dogWalk,
      seasonalSurchargePercent: surchargePercent
    };
  }
);

Given(
  'the price rates are one-visit €{float}, two-visits €{float}, dog-walk €{float}, seasonal surcharge {int}%, extra cat €{float} per day',
  async ({}, oneVisit, twoVisits, dogWalk, surchargePercent, extraCatPricePerDay) => {
    world.rates = {
      priceOneVisit: oneVisit,
      priceTwoVisits: twoVisits,
      dogWalkPriceFrom: dogWalk,
      seasonalSurchargePercent: surchargePercent,
      extraCatPricePerDay: extraCatPricePerDay
    };
  }
);

Given(
  'a booking from {string} to {string} for a cat with {string} preference',
  async ({}, from, to, preference) => {
    world.booking = { date_from: from, date_to: to, pets: [{ type: 'cat' }], preference };
  }
);

Given(
  'a booking from {string} to {string} for {int} cats with {string} preference',
  async ({}, from, to, catCount, preference) => {
    world.booking = {
      date_from: from,
      date_to: to,
      pets: Array.from({ length: catCount }, () => ({ type: 'cat' })),
      preference
    };
  }
);

Given(
  'a booking from {string} to {string} for a cat and a dog with {string} preference',
  async ({}, from, to, preference) => {
    world.booking = {
      date_from: from,
      date_to: to,
      pets: [{ type: 'cat' }, { type: 'dog' }],
      preference
    };
  }
);

When('the invoice line items are calculated', async () => {
  world.result = buildInvoiceLineItems(world.booking, world.rates);
});

Then('the invoice has {int} line item', async ({}, count) => {
  expectEqual(world.result.items.length, count, 'line item count');
});

Then('the invoice has {int} line items', async ({}, count) => {
  expectEqual(world.result.items.length, count, 'line item count');
});

Then(
  'line item {int} is a {string} season {string} for {string} covering {int} days at €{float} per day',
  async ({}, index, season, type, service, dayCount, unitPrice) => {
    const item = world.result.items[index - 1];
    if (!item) throw new Error(`Expected line item #${index} to exist, got ${world.result.items.length} items`);
    expectEqual(item.season, season, `line item ${index} season`);
    expectEqual(item.type, type, `line item ${index} type`);
    expectEqual(item.service, service, `line item ${index} service`);
    expectEqual(item.dayCount, dayCount, `line item ${index} dayCount`);
    expectEqual(item.unitPrice, unitPrice, `line item ${index} unitPrice`);
  }
);

Then('the invoice total is €{float}', async ({}, total) => {
  expectEqual(world.result.total, total, 'invoice total');
});

function expectEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}
