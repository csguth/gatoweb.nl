# Copilot instructions — gatoweb.nl

This repo is a **Hugo-built static site** (Go templates + Tailwind CDN + Alpine.js CDN) with a
Supabase backend (bookings + auth) and a Playwright/BDD test suite. It is the reference project
that `csguth/machinemens.com` mirrors (lighter, zero-build variant). Read `README.md` first for
the full picture (stack, environments, deploy config, secrets). This file has the operating rules
for agent sessions.

## Golden rules
- Shared markup lives in `layouts/` (partials + `_default/baseof.html`); page content/metadata
  lives in `content/**/_index.{en,nl,pt}.md`; assets served as-is live in `static/`. The build
  outputs to `site/` (git-ignored, `publishDir = "site"` in `hugo.toml`) — that's what actually
  gets deployed.
- i18n is **compile-time / URL-per-language** (Hugo multilingual): `/en/`, `/nl/`, `/pt/` are each
  a fully-rendered page. UI strings live in `i18n/{en,nl,pt}.toml` (`{{ i18n "key" }}`); strings
  built by JS live in `static/locales/{en,nl,pt}.json` (`t('...')`). The bare root `/` is a JS
  redirect honouring `localStorage.gatoweb_lang` → browser language → English. Don't reintroduce
  client-side language toggling — add new strings as i18n keys in all three languages and run
  `node scripts/i18n-check.mjs` to verify coverage.
- Placeholders (`__SITE_URL__`, `__ENV_LABEL__`, `__BRAND_NAME__`, `__WHATSAPP_NUMBER__`, …) are
  kept verbatim in `content/`, `layouts/`, `i18n/*.toml`, `static/{robots.txt,sitemap.xml,locales/*.json}`
  and substituted with `sed` over every generated file in `site/` at deploy time
  (`.github/actions/build-site`). Never hardcode a real value for one of these into a template —
  the build fails if any placeholder survives substitution. Values only needed by JS
  (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, invoice business details) go into a generated
  `js/config.js` instead, not `sed`-substituted.
- Never edit `main` or `staging` directly — both require a PR (no direct pushes, force-pushes or
  deletions). All work happens on a feature branch, PR'd into `staging` first; promotion
  `staging -> main` is its own PR using a **regular merge, never squash/rebase**, so the exact
  tested commit reaches `main`. `.github/workflows/guard-main-merges.yml` enforces this (only
  `staging` or a PR labeled `hotfix` may target `main`) — don't remove/weaken it without the
  user's explicit approval.
- Two Supabase projects exist, one per environment (`gato-catsit` prod, `gato-catsit-staging`
  staging) — never point one environment's config at the other's project.

## Automated tests
A Playwright + playwright-bdd (Gherkin) suite lives in `tests/bdd/` (`npm test`). It builds real
Hugo fixtures (`tests/bdd/support/build-fixtures.mjs` runs `hugo --gc --minify` with fake values)
so **Hugo must be installed locally** to run it. `.github/workflows/test.yml` runs the same suite
as a reusable workflow (`workflow_call`) invoked by each deploy workflow (GitHub Pages, Cloudflare
staging, Cloudflare PR previews) so a deploy only proceeds once tests pass — not on its own
push/PR trigger anymore, to avoid a redundant duplicate run. When changing user-facing behavior
(booking form, i18n routing, invoice calc, staging banner), add or update the matching
`.feature`/`.steps.mjs` pair instead of only eyeballing the change — these are the project's
regression safety net.
`.github/workflows/w3c-compliance.yml` also validates every generated page; don't introduce
invalid HTML to work around a layout issue.

## Project board workflow
Every feature/issue is triaged onto the "Gato Catsit — Website Roadmap" GitHub Project (owner
`csguth`, project #1) first, then planned favoring simplicity, then implemented as a PR into
`staging`. Use `.github/skills/github-project-management/SKILL.md` for the exact `gh` CLI
commands and IDs — don't rediscover them from scratch each session.

## Feature branch preview
Use the `/deploy-preview` prompt (`.github/prompts/deploy-preview.prompt.md`) to push a feature
branch to an isolated Cloudflare Pages preview URL before merging, without touching
`staging.gatoweb.nl` or `main`. It shares the `staging` Supabase project's data, so treat preview
test data as shared with staging.

## Secrets/vars this repo depends on (see README "Deploy updates" for the full table)
- Required in both environments: `WHATSAPP_NUMBER`, `BRAND_NAME`, `SITE_URL`, `CONTACT_EMAIL`,
  `CITY_NAME`, `PRICE_ONE_VISIT`, `PRICE_TWO_VISITS`, `DOG_WALK_PRICE_FROM`.
- Optional (facturen/invoicing): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BUSINESS_LEGAL_NAME`,
  `BUSINESS_ADDRESS`, `KVK_NUMBER`, `IBAN_NUMBER`, `BTW_EXEMPT`, `SEASONAL_SURCHARGE_PERCENT`,
  `PRICE_EXTRA_CAT_PER_DAY`.
- Internal/infra: `ENV_LABEL`, `CLOUDFLARE_ACCOUNT_ID` (var), `CLOUDFLARE_API_TOKEN` (secret).
- None of these are stored in the repo; if a workflow fails with "Missing variable", it's a
  one-time GitHub Settings configuration gap, not a code bug — tell the user which one is missing.

## Building locally
```
hugo server            # dev server with live reload, http://localhost:1313
hugo --gc --minify      # one-off build into site/
node scripts/i18n-check.mjs
npm ci && npm test      # BDD suite (requires Hugo installed locally)
```
