// Global BDD hooks (not tied to any single feature).
import { createBdd } from 'playwright-bdd';
import { resetWorld } from '../support/world.mjs';

const { Before } = createBdd();

Before(async () => {
  resetWorld();
});
