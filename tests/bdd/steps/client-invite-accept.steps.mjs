// Step definitions for tests/bdd/features/client-invite-accept.feature
// (layouts/account/list.html + js/account/account-app.js, issue #179).
// Runs against the "production-auth" fixture via @auth-required, same
// approach as account-tikkie.steps.mjs: no real backend — invite/session/
// profile state is seeded straight into accountApp()'s Alpine state via the
// Alpine.$data() bridge, simulating loadInvitePreview()/afterLogin()'s
// outcomes without a real network round-trip.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

function app(page) {
  return page.locator('[data-x-data="accountApp()"]');
}

async function goToAccountPage(page) {
  await page.goto('/en/account/');
  await page.waitForFunction(() => window.i18next && window.i18next.isInitialized);
  await page.waitForFunction(
    () => window.Alpine && document.querySelector('[data-x-data="accountApp()"]')
  );
}

Given('I land on my account page via an invite link for {string}', async ({ page }, name) => {
  await goToAccountPage(page);
  await page.evaluate((name) => {
    const el = document.querySelector('[data-x-data="accountApp()"]');
    const data = window.Alpine.$data(el);
    data.inviteToken = 'test-token';
    data.inviteClientName = name;
    // Mirrors what loadInvitePreview() itself does on a real invite link.
    data.mode = 'signup';
  }, name);
});

Given('I land on my account page via an expired invite link', async ({ page }) => {
  await goToAccountPage(page);
  await page.evaluate(() => {
    const el = document.querySelector('[data-x-data="accountApp()"]');
    const data = window.Alpine.$data(el);
    data.inviteToken = null;
    data.inviteError = window.t('auth.invite_invalid_or_expired');
  });
});

When(
  'I finish signing up and my Profile {string} with pets {string} is linked',
  async ({ page }, name, pets) => {
    await page.evaluate(({ name, pets }) => {
      const el = document.querySelector('[data-x-data="accountApp()"]');
      const data = window.Alpine.$data(el);
      data.inviteToken = null;
      data.session = { user: { email: 'client@example.com' } };
      data.profile = { name, pets: [{ name: pets.split(' (')[0], type: pets.split('(')[1].replace(')', '') }] };
      data.loadingList = false;
      data.bookings = [];
    }, { name, pets });
  }
);

When('I finish signing up and {int} previous bookings are linked', async ({ page }, count) => {
  await page.evaluate((count) => {
    const el = document.querySelector('[data-x-data="accountApp()"]');
    const data = window.Alpine.$data(el);
    data.inviteToken = null;
    data.session = { user: { email: 'client@example.com' } };
    data.linkedBookingsCount = count;
    data.loadingList = false;
    data.bookings = [];
  }, count);
});

Then('I do not see the login-or-signup toggle', async ({ page }) => {
  await expect(app(page).getByRole('button', { name: 'Log in', exact: true })).toHaveCount(0);
});

Then('the submit button reads {string}', async ({ page }, text) => {
  await expect(app(page).getByRole('button', { name: text, exact: true })).toBeVisible();
});

Then('I see the {string} greeting', async ({ page }, text) => {
  await expect(app(page).getByText(text)).toBeVisible();
});

Then('I see the {string} message', async ({ page }, text) => {
  await expect(app(page).getByText(text)).toBeVisible();
});

Then('I do not see {string}', async ({ page }, text) => {
  await expect(app(page).getByText(text)).toHaveCount(0);
});

Then('I see {string}', async ({ page }, text) => {
  await expect(app(page).getByText(text)).toBeVisible();
});

Then('I see a message that {int} previous bookings were linked', async ({ page }, count) => {
  await expect(app(page).getByText(new RegExp('linked ' + count + ' previous booking'))).toBeVisible();
});
