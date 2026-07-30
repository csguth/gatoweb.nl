// Runtime config for the whole site. This file is committed with safe empty/zero
// defaults ("not configured" state, e.g. for local/offline preview) and gets
// OVERWRITTEN inside the build output (site/js/config.js) at deploy time by
// .github/workflows/deploy-pages.yml and deploy-staging-cloudflare.yml, which fill in
// the real values from GitHub repo/environment variables. Never edit the generated
// version by hand — edit the workflow(s) instead.
window.GATOWEB_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  BUSINESS_LEGAL_NAME: '',
  BUSINESS_ADDRESS: '',
  KVK_NUMBER: '',
  IBAN_NUMBER: '',
  BTW_EXEMPT: '',
  BRAND_NAME: '',
  PRICE_ONE_VISIT: 0,
  PRICE_TWO_VISITS: 0,
  DOG_WALK_PRICE_FROM: 0,
  // Percentage surcharge applied to invoice line items that fall in high-season
  // months (Jul, Aug, Dec, Jan) — see js/facturen/invoice-calc.js. 0 means no
  // surcharge is applied. Only affects the final invoice, never the public
  // price estimate shown on the booking form.
  SEASONAL_SURCHARGE_PERCENT: 0,
  // Flat amount per day charged for each cat beyond the first one in the same
  // booking — see js/facturen/invoice-calc.js. 0 means no extra charge. Unlike
  // SEASONAL_SURCHARGE_PERCENT, this DOES affect the public price estimate shown
  // on the booking form, since it's known upfront (not a seasonal surprise).
  PRICE_EXTRA_CAT_PER_DAY: 0
};
