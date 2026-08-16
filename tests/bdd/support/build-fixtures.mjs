// Builds three throwaway "compiled" copies of the site (production / staging /
// production-with-auth) by running the real Hugo build and then applying the same
// __PLACEHOLDER__ substitution + js/config.js generation that
// .github/actions/build-site does at deploy time. This lets the BDD tests exercise the
// site exactly as it will be served — same per-language URLs, same minified markup —
// instead of the raw repo sources, which contain no rendered pages at all.
//
// Output: <tmp>/gatoweb-nl-test-site/<variant> (rebuilt every run).
import { mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { repoRoot, fixturesRoot as outRoot } from './paths.mjs';

const execFileAsync = promisify(execFile);

// Deliberately fake but realistic-looking values — good enough to assert on in
// tests without touching any real business/production data.
const BASE_VARS = {
  __WHATSAPP_NUMBER__: '31699999999',
  __BRAND_NAME__: 'Gato Catsit (Test)',
  __SITE_URL__: 'http://localhost',
  __CONTACT_EMAIL__: 'test@example.com',
  __CITY_NAME__: "'s-Hertogenbosch",
  __PRICE_ONE_VISIT__: '15',
  __PRICE_TWO_VISITS__: '25',
  __DOG_WALK_PRICE_FROM__: '10',
  __INSTAGRAM_HANDLE__: 'gatocatsit'
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

// Same set the deploy action substitutes over: every generated text file, but not
// js/*.js (the only per-environment JS values live in the generated js/config.js).
const SUBSTITUTED_EXTENSIONS = new Set(['.html', '.json', '.xml', '.txt']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function hugoBuild(destination) {
  try {
    await execFileAsync('hugo', ['--gc', '--minify', '--destination', destination], {
      cwd: repoRoot
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        'Hugo is required to build the test fixtures but was not found on PATH.\n' +
          'Install the extended build (same version as .github/actions/setup-hugo) from\n' +
          'https://github.com/gohugoio/hugo/releases and try again.'
      );
    }
    throw new Error(`hugo build failed:\n${err.stderr || err.message}`);
  }
}

async function buildVariant(name, vars) {
  const dest = path.join(outRoot, name);
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });

  await hugoBuild(dest);

  const allVars = { ...BASE_VARS, __ENV_LABEL__: vars.ENV_LABEL };
  for await (const filePath of walk(dest)) {
    if (!SUBSTITUTED_EXTENSIONS.has(path.extname(filePath))) continue;
    const original = await readFile(filePath, 'utf8');
    let contents = original;
    for (const [placeholder, value] of Object.entries(allVars)) {
      contents = contents.split(placeholder).join(value);
    }
    if (contents !== original) await writeFile(filePath, contents, 'utf8');
  }

  const config = {
    SUPABASE_URL: vars.SUPABASE_URL,
    SUPABASE_ANON_KEY: vars.SUPABASE_ANON_KEY,
    BUSINESS_LEGAL_NAME: 'Gato Catsit Test BV',
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
  // Sequentially: concurrent `hugo` runs in the same project directory race on the
  // shared resources/ cache and the .hugo_build.lock file.
  for (const [name, vars] of Object.entries(CONFIG_BY_ENV)) {
    await buildVariant(name, vars);
  }
  console.log('Built test fixtures in', outRoot, ':', Object.keys(CONFIG_BY_ENV).join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
