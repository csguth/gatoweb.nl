// cucumber-js config for the "pure logic" scenarios: no DOM, no browser, no
// Playwright/webServer infra needed. These .feature files stay put under
// tests/bdd/features/ (same Gherkin used to be run by playwright-bdd) — only
// the step definitions/runner change, see tests/unit/steps/*.steps.mjs.
// Run with: npm run test:unit (see package.json).
module.exports = {
  default: {
    paths: [
      'tests/bdd/features/booking-sort.feature',
      'tests/bdd/features/client-invite-actions.feature',
      'tests/bdd/features/client-invite-link.feature',
      'tests/bdd/features/client-list.feature',
      'tests/bdd/features/format-date.feature',
      'tests/bdd/features/gcal-sync-daily-plan.feature',
      'tests/bdd/features/gcal-sync-event.feature',
      'tests/bdd/features/gcal-sync-occurrences.feature',
      'tests/bdd/features/gcal-sync-sync-decision.feature',
      'tests/bdd/features/invite-intake.feature',
      'tests/bdd/features/invoice-calc.feature',
      'tests/bdd/features/invoice-document.feature',
      'tests/bdd/features/payment-url.feature'
    ],
    import: ['tests/unit/support/hooks.mjs', 'tests/unit/steps/**/*.mjs'],
    format: ['summary', 'progress']
  }
};
