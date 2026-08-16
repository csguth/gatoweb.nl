// Local preview helper: substitutes the deploy-time __PLACEHOLDER__ values into a
// built ./site so it can be served and eyeballed (or audited by
// scripts/contrast-audit.mjs). Not used by CI.
//
//   hugo --gc --minify --destination site && node scripts/preview-fill.mjs
import fs from 'node:fs';

const vars = {
  __SITE_URL__: 'http://127.0.0.1:8913',
  __BRAND_NAME__: 'Gato Catsit',
  __CITY_NAME__: "'s-Hertogenbosch",
  __ENV_LABEL__: 'production',
  __WHATSAPP_NUMBER__: '31600000000',
  __CONTACT_EMAIL__: 'ligia@example.com',
  __PRICE_ONE_VISIT__: '20',
  __PRICE_TWO_VISITS__: '32',
  __DOG_WALK_PRICE_FROM__: '10',
};

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (/\.(html|json|xml|txt)$/.test(full)) {
      let s = fs.readFileSync(full, 'utf8');
      for (const [k, v] of Object.entries(vars)) s = s.split(k).join(v);
      fs.writeFileSync(full, s, 'utf8');
    }
  }
}

walk('site');
fs.writeFileSync(
  'site/js/config.js',
  `window.GATOWEB_CONFIG=${JSON.stringify({
    PRICE_ONE_VISIT: 20,
    PRICE_TWO_VISITS: 32,
    DOG_WALK_PRICE_FROM: 10,
    BRAND_NAME: 'Gato Catsit',
    WHATSAPP_NUMBER: '31600000000',
    SEASONAL_SURCHARGE_PERCENT: 20,
    PRICE_EXTRA_CAT_PER_DAY: 5,
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
  })};\n`,
);
console.log('preview ready in ./site');
