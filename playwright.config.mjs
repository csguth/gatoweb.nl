import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { fixturesRoot, FIXTURE_PORTS } from './tests/bdd/support/paths.mjs';

// Three Playwright-bdd projects, one per built fixture, each tagged so only the
// scenarios relevant to that fixture run against it:
//  - production        : default env, Supabase NOT configured (most scenarios)
//  - staging           : same site, ENV_LABEL=staging -> banner visible
//  - production-auth   : Supabase "configured" (fake project) -> login gate scenario
const bddProduction = defineBddConfig({
  features: 'tests/bdd/features/**/*.feature',
  steps: 'tests/bdd/steps/**/*.mjs',
  outputDir: 'tests/bdd/.features-gen/production',
  tags: 'not @staging-env and not @auth-required'
});

const bddStaging = defineBddConfig({
  features: 'tests/bdd/features/**/*.feature',
  steps: 'tests/bdd/steps/**/*.mjs',
  outputDir: 'tests/bdd/.features-gen/staging',
  tags: '@staging-env'
});

const bddProductionAuth = defineBddConfig({
  features: 'tests/bdd/features/**/*.feature',
  steps: 'tests/bdd/steps/**/*.mjs',
  outputDir: 'tests/bdd/.features-gen/production-auth',
  tags: '@auth-required'
});

export default defineConfig({
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: [
    {
      command: `npx http-server "${fixturesRoot}/production" -p ${FIXTURE_PORTS.production} -c-1 -s`,
      url: `http://localhost:${FIXTURE_PORTS.production}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    },
    {
      command: `npx http-server "${fixturesRoot}/staging" -p ${FIXTURE_PORTS.staging} -c-1 -s`,
      url: `http://localhost:${FIXTURE_PORTS.staging}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    },
    {
      command: `npx http-server "${fixturesRoot}/production-auth" -p ${FIXTURE_PORTS['production-auth']} -c-1 -s`,
      url: `http://localhost:${FIXTURE_PORTS['production-auth']}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    }
  ],
  projects: [
    {
      name: 'production',
      testDir: bddProduction,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${FIXTURE_PORTS.production}` }
    },
    {
      name: 'staging',
      testDir: bddStaging,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${FIXTURE_PORTS.staging}` }
    },
    {
      name: 'production-auth',
      testDir: bddProductionAuth,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${FIXTURE_PORTS['production-auth']}` }
    }
  ]
});
