// Global cucumber-js hooks (not tied to any single feature) — the cucumber-js
// equivalent of tests/bdd/steps/hooks.steps.mjs, reusing the same shared
// "world" object so migrated step files behave exactly like before.
import { Before, After } from '@cucumber/cucumber';
import { resetWorld } from '../../bdd/support/world.mjs';

Before(async () => {
  resetWorld();
});

// invoice-document.steps.mjs stubs `global.window` (no DOM available under
// cucumber-js/Node) to drive js/shared/invoice-document.js — clean it up
// after each scenario so it never leaks into unrelated scenarios/files.
After(async () => {
  delete global.window;
});
