// Shared path constants for the BDD test fixtures (built site copies) so
// build-fixtures.mjs and playwright.config.js stay in sync.
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../../../../');
export const fixturesRoot = path.join(os.tmpdir(), 'gatoweb-nl-test-site');

export const FIXTURE_PORTS = {
  production: 4180,
  staging: 4181,
  'production-auth': 4182
};
