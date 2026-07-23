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
  DOG_WALK_PRICE_FROM: 0
};
