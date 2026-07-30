// Builds two throwaway "compiled" copies of the static site (production/staging),
// mirroring the same __PLACEHOLDER__ substitution + js/config.js generation that
// .github/workflows/deploy-pages.yml and deploy-staging-cloudflare.yml do at deploy
// time. This lets BDD tests exercise the site exactly as it will be served, instead
// of the raw repo copy that still has literal `__WHATSAPP_NUMBER__` etc. placeholders.
//
// Output: .test-site/<variant> (gitignored, rebuilt every run).
import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { repoRoot, fixturesRoot as outRoot } from './paths.mjs';

// Deliberately fake but realistic-looking values — good enough to assert on in
// tests without touching any real business/production data.
const BASE_VARS = {
  __WHATSAPP_NUMBER__: '31699999999',
  __BRAND_NAME__: 'Gato Petsit (Test)',
  __SITE_URL__: 'http://localhost',
  __CONTACT_EMAIL__: 'test@example.com',
  __CITY_NAME__: "'s-Hertogenbosch",
  __PRICE_ONE_VISIT__: '15',
  __PRICE_TWO_VISITS__: '25',
  __DOG_WALK_PRICE_FROM__: '10'
};

const CONFIG_BY_ENV = {
  production: {
    ENV_LABEL: 'production',
    // Supabase left unconfigured for the default production fixture: most
    // scenarios don't need a real backend, and the login-gate scenario builds its
    // own fixture variant (see 'production-auth' below).
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    SEASONAL_SURCHARGE_PERCENT: '20',
    PRICE_EXTRA_CAT_PER_DAY: '5'
  },
  staging: {
    ENV_LABEL: 'staging',
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    SEASONAL_SURCHARGE_PERCENT: '20',
    PRICE_EXTRA_CAT_PER_DAY: '5'
  },
  'production-auth': {
    ENV_LABEL: 'production',
    // Fake-but-valid-looking Supabase project so window.__gatoClientAuth.configured
    // is true and the login gate renders. supabase-js's getSession() only reads
    // localStorage (no network call), so no real backend is needed for this.
    SUPABASE_URL: 'https://gatoweb-test-fixture.supabase.co',
    SUPABASE_ANON_KEY: 'test-fixture-anon-key',
    SEASONAL_SURCHARGE_PERCENT: '20',
    PRICE_EXTRA_CAT_PER_DAY: '5'
  }
};

const SOURCE_FILES_WITH_PLACEHOLDERS = [
  'index.html',
  'facturen.html',
  'account.html',
  'locales/en.json',
  'locales/nl.json',
  'locales/pt.json',
  'robots.txt',
  'sitemap.xml'
];

async function buildVariant(name, vars) {
  const dest = path.join(outRoot, name);
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });

  await cp(repoRoot, dest, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(repoRoot, src);
      if (!rel) return true;
      const first = rel.split(path.sep)[0];
      return !['node_modules', '.git', '.github', '.test-site', 'tests', 'test-results', 'playwright-report'].includes(first);
    }
  });

  const allVars = { ...BASE_VARS, __ENV_LABEL__: vars.ENV_LABEL };
  for (const relFile of SOURCE_FILES_WITH_PLACEHOLDERS) {
    const filePath = path.join(dest, relFile);
    if (!existsSync(filePath)) continue;
    let contents = await readFile(filePath, 'utf8');
    for (const [placeholder, value] of Object.entries(allVars)) {
      contents = contents.split(placeholder).join(value);
    }
    await writeFile(filePath, contents, 'utf8');
  }

  const config = {
    SUPABASE_URL: vars.SUPABASE_URL,
    SUPABASE_ANON_KEY: vars.SUPABASE_ANON_KEY,
    BUSINESS_LEGAL_NAME: 'Gato Petsit Test BV',
    BUSINESS_ADDRESS: 'Teststraat 1, 5211 AB \'s-Hertogenbosch',
    KVK_NUMBER: '12345678',
    IBAN_NUMBER: 'NL00TEST0123456789',
    BTW_EXEMPT: 'true',
    BRAND_NAME: BASE_VARS.__BRAND_NAME__,
    PRICE_ONE_VISIT: Number(BASE_VARS.__PRICE_ONE_VISIT__),
    PRICE_TWO_VISITS: Number(BASE_VARS.__PRICE_TWO_VISITS__),
    DOG_WALK_PRICE_FROM: Number(BASE_VARS.__DOG_WALK_PRICE_FROM__),
    SEASONAL_SURCHARGE_PERCENT: Number(vars.SEASONAL_SURCHARGE_PERCENT),
    PRICE_EXTRA_CAT_PER_DAY: Number(vars.PRICE_EXTRA_CAT_PER_DAY),
    WHATSAPP_NUMBER: BASE_VARS.__WHATSAPP_NUMBER__
  };
  const configJs = `window.GATOWEB_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
  await writeFile(path.join(dest, 'js', 'config.js'), configJs, 'utf8');
}

async function main() {
  await Promise.all(Object.entries(CONFIG_BY_ENV).map(([name, vars]) => buildVariant(name, vars)));
  console.log('Built test fixtures in', outRoot, ':', Object.keys(CONFIG_BY_ENV).join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
