# gatoweb.nl — Gato Catsit

Professional catsitting service by Lígia in 's-Hertogenbosch.

## Stack (Hugo static site generator, all free/cheap)

| Tool | Purpose | Cost |
|---|---|---|
| Hugo (extended) | Static site generator: one fully-translated page per language | Free |
| Plain HTML + Tailwind CDN | Website | Free |
| Alpine.js CDN | Booking form, facturen dashboard, client account | Free |
| Supabase | Bookings database + Auth (facturen feature) | Free tier |
| Browser print (`@media print`) | A4 invoice layout, "Save as PDF" via native print dialog | Free |
| WhatsApp | Direct booking / confirmation | Free |
| GitHub Pages | Production hosting + HTTPS (`gatoweb.nl`) | Free |
| Cloudflare Pages | Staging hosting (`staging.gatoweb.nl`) | Free |
| **gatoweb.nl** | Custom domain (registrar: Namecheap) | ~€12/year |

**Monthly cost: €0** (just the domain renewal once a year)

---

## Repository structure

```
hugo.toml            Hugo config: languages (en/nl/pt), publishDir = site/, minify settings
content/             Page front matter only (title/description/flags), one file per language
  _index.{en,nl,pt}.md          Home page
  account/_index.{en,nl,pt}.md  Client "My bookings" page
  facturen/_index.{en,nl,pt}.md Ligia's private invoicing dashboard
layouts/
  _default/baseof.html   Shared page skeleton (<html>/<head>/<body>)
  index.html             Home page markup
  account/list.html      Client account page markup
  facturen/list.html     Invoicing dashboard markup
  alias.html             Redirect template: bare "/" language picker + legacy URLs
  partials/              head.html, staging-banner.html, lang-switcher.html, icon.html, whatsapp-glyph.html
i18n/{en,nl,pt}.toml   Compile-time UI strings ({{ i18n "static.<page>.<section>.<slug>" }})
static/                Copied verbatim into the build output
  css/ js/ images/
  images/icons/            Brand icon set from the Canva design (scripts/canva-icons.py)
  locales/{en,nl,pt}.json   Runtime-only strings that JavaScript builds (t('...'))
  robots.txt, sitemap.xml, CNAME
  account.html, facturen.html  Redirect stubs for the pre-Hugo URLs
site/                  Build output (git-ignored) — what actually gets deployed
supabase/schema.sql    Database schema: bookings table, RLS policies, approve_booking()
scripts/i18n-check.mjs Checks that every i18n/t() key used actually exists in all languages
scripts/canva-icons.py Rebuilds static/images/icons/ from Lígia's Canva design (#139)
.github/actions/
  setup-hugo/          Installs the pinned Hugo version (used by every workflow)
  build-site/          hugo build + placeholder substitution + generated js/config.js
  apply-db-migration/
.github/workflows/
  deploy-pages.yml               Production deploy -> GitHub Pages (push to main)
  deploy-staging-cloudflare.yml  Staging deploy -> Cloudflare Pages (push to staging)
  deploy-preview-cloudflare.yml  Per-PR preview deploy -> Cloudflare Pages
  guard-main-merges.yml          Enforces the staging -> main promotion order (see below)
  test.yml                       BDD test suite
  w3c-compliance.yml             W3C Nu Html Checker over every generated page
  keep-alive.yml                 Daily ping to keep both Supabase projects from auto-pausing
```

### Building locally

```
hugo server            # dev server with live reload, http://localhost:1313
hugo --gc --minify     # one-off build into site/
node scripts/i18n-check.mjs
```

The `__PLACEHOLDER__` values (`__BRAND_NAME__`, `__SITE_URL__`, …) stay literal in a local
build — they're only substituted at deploy time (see [Deploy updates](#deploy-updates)).

---

## URLs and languages

Every language is a real, fully-rendered page under its own path:

| URL | Page |
|---|---|
| `/` | Tiny redirect that sends the visitor to their saved/detected language |
| `/en/`, `/nl/`, `/pt/` | Public landing page + booking form |
| `/en/account/`, `/nl/account/`, `/pt/account/` | Client "My bookings" page (`noindex`) |
| `/en/facturen/`, `/nl/facturen/`, `/pt/facturen/` | Ligia's invoicing dashboard (`noindex`) |
| `/account.html`, `/facturen.html` | Redirect stubs kept for pre-Hugo bookmarks |

- The language selector is a set of plain links to the current page's other languages,
  not a JavaScript toggle. `static/js/lang-persist.js` records whichever language page
  you land on in `localStorage.gatoweb_lang`, and `static/js/root-redirect.js` reads it
  back at `/`.
- `localStorage.gatoweb_lang` is deliberately the same key the old client-side toggle
  used, so visitors keep the language they had already chosen.
- The private pages are **not** listed in `robots.txt`: that file is world-readable, so a
  `Disallow` line advertises the admin panel's location rather than hiding it. They're
  kept out of search results by their `noindex,nofollow` meta tag and out of
  `sitemap.xml`, and actually protected by Supabase Auth + RLS.

> **Supabase note:** the auth confirmation e-mail redirects back to
> `window.location.origin + window.location.pathname`, which is now language-prefixed.
> Make sure the Supabase project's *Redirect URLs* allowlist covers `/en/*`, `/nl/*`
> and `/pt/*` (e.g. `https://gatoweb.nl/**`).

---

## Features

✅ **Compile-time i18n (EN/NL/PT)** — Hugo renders one fully-translated page per language at its own URL; static copy lives in `i18n/*.toml`, runtime JS strings in `static/locales/*.json`
✅ **Real reviews** — 50+ five-star reviews from Pawshake
✅ **WhatsApp booking** — Direct message with pre-filled dates/pets/preference
✅ **Booking persistence** — Booking form also saves an optional record to Supabase (`bookings` table) when configured
✅ **Facturen (invoices) dashboard** — private page for Ligia: Supabase Auth login, lists all bookings sorted by what needs action (approve → send Tikkie → done), generates a PDF invoice client-side with a sequential invoice number
✅ **Responsive** — Mobile-first design with Tailwind CSS
✅ **SEO optimized** — Per-language URLs with hreflang + `x-default`, canonical, Open Graph/Twitter cards, robots.txt, sitemap.xml
✅ **W3C-valid markup** — every generated page is validated in CI by the W3C Nu Html Checker
✅ **Staging environment** — Full parallel environment (own Supabase project + own Cloudflare Pages deployment) with a visible "STAGING" banner, so features can be tested before reaching production

---

## Environments

| | Production | Staging |
|---|---|---|
| Branch | `main` | `staging` |
| URL | https://gatoweb.nl | https://staging.gatoweb.nl |
| Hosting | GitHub Pages | Cloudflare Pages (project `gatoweb-nl-staging`) |
| Workflow | `deploy-pages.yml` | `deploy-staging-cloudflare.yml` |
| GitHub Environment | `github-pages` (build/deploy jobs) + repo-level vars | `staging` (scoped vars) |
| Supabase project | `gato-catsit` | `gato-catsit-staging` |
| Visual indicator | none (`data-env="production"`, banner hidden) | amber "🚧 STAGING" banner (`data-env="staging"`) |

Both environments are built from the exact same source files — the only difference is which
GitHub Environment's variables get substituted at deploy time (see [Deploy updates](#deploy-updates)).

---

## Branching & promotion workflow

New work follows a **feature → staging → manual test → production** flow, enforced by branch
protection (not just convention):

```
git checkout staging && git pull
git checkout -b feature/my-change
# ... work, commit ...
# Open a PR: feature/my-change -> staging
# Merge -> auto-deploys to https://staging.gatoweb.nl
# Test manually on staging
# Open a PR: staging -> main  (use a regular merge, NEVER squash/rebase,
#                              so the exact tested commit reaches main)
# Merge -> auto-deploys to https://gatoweb.nl
```

Rules enforced on GitHub:
- Both `main` and `staging` require a Pull Request to merge (no direct pushes) and block force-pushes/deletions.
- `.github/workflows/guard-main-merges.yml` fails any PR targeting `main` whose source branch isn't
  `staging`, unless the PR is labeled `hotfix` (emergency bypass for urgent production fixes).
- `.github/workflows/test.yml` runs the BDD test suite (see [Automated tests](#automated-tests)) on
  every push/PR to `staging` and `main`. It is not yet marked as a required status check — do that
  in `staging`'s branch protection settings once you've seen it pass reliably a few times.
- `.github/workflows/w3c-compliance.yml` validates every generated page with the W3C Nu Html
  Checker on PRs into `staging` and `main`. This should also be set as a **required status check**
  in both branches' protection rules once it has passed reliably a few times.

---

## Automated tests

A [Playwright](https://playwright.dev/) + [playwright-bdd](https://vitalets.github.io/playwright-bdd/)
(Gherkin) test suite lives in `tests/bdd/` and covers the main user-facing requirements:

- **Booking form** (`tests/bdd/features/booking-form.feature`) — required-field validation, suggested
  price calculation, the WhatsApp confirmation message, and the login gate when Supabase auth is configured.
- **Per-language URLs** (`tests/bdd/features/i18n.feature`) — that `/en/`, `/nl/` and `/pt/` each render
  their own language, that the selector links between them, and that `/` redirects using the saved
  preference or the browser language.
- **Invoice calculation** (`tests/bdd/features/invoice-calc.feature`) — `static/js/facturen/invoice-calc.js`,
  including the high-season surcharge split.
- **Staging banner** (`tests/bdd/features/staging-banner.feature`) — visible on the staging build,
  hidden on production.
- **Google Calendar sync** (`tests/bdd/features/gcal-sync-event.feature`,
  `gcal-sync-sync-decision.feature`) — `supabase/functions/gcal-sync/logic.js`: the time slot derived
  from a booking's visit preference, and the create/update/delete/skip decision for every
  INSERT/UPDATE/DELETE of a booking row (issue #160).

The tests run against the real thing: `tests/bdd/support/build-fixtures.mjs` invokes
`hugo --gc --minify` three times (production / staging / production-with-auth) into a temp folder and
then applies the same placeholder substitution and `js/config.js` generation the deploy workflows do,
with fake test values — no real secrets or deployments involved. **Hugo must therefore be installed
locally to run the suite.**

### Testing pure logic (no browser/DOM needed)

Business logic that doesn't need a DOM — pricing math, or the Google Calendar sync decisions — is
kept in a plain, framework-agnostic JS module with no imports from Alpine/i18next/Deno/etc
(`static/js/facturen/invoice-calc.js`, `supabase/functions/gcal-sync/logic.js`). Any runtime-specific
code (the browser page, or the Deno Edge Function) is kept as a thin adapter that only wires that
pure module up to real I/O (DOM events, `fetch` calls) — it should rarely need its own tests, since it
contains no decisions of its own to get wrong.

Because the module has no runtime-specific dependencies, its BDD steps
(`tests/bdd/steps/invoice-calc.steps.mjs`, `tests/bdd/steps/gcal-sync-*.steps.mjs`) `import` it
directly and call it like a plain function — no browser page, no Deno, no real network/database calls.
This is the preferred pattern for new backend/business-logic features going forward:

1. Write the Gherkin scenarios first (`tests/bdd/features/*.feature`) in plain product language —
   they double as living, human-readable requirements documentation that survives independently of
   whichever AI/developer wrote the implementation.
2. Confirm they fail (the step file importing a not-yet-created module is enough to prove this).
3. Implement the pure module to make them pass, then wire it into the thin adapter (Deno handler,
   Alpine component, etc.) — the adapter itself stays intentionally free of business rules.

This keeps the code base's actual decisions concentrated in small, dependency-free modules that are
easy for a human (or a different LLM) to pick up, verify and extend with confidence, independently of
whichever tool was used to write them.

### Running locally

```
npm ci
npx playwright install --with-deps chromium   # first time only
npm test                                      # builds fixtures, generates specs, runs everything
npm run test:bdd:headed                       # same, but with a visible browser
npm run test:bdd:report                       # opens the last HTML report
```

CI runs the same suite (`.github/workflows/test.yml`) on every push/PR to `staging` and `main`, inside
the official Playwright Docker image (`mcr.microsoft.com/playwright:v1.62.0-noble`) so the exact same
browser/OS/dependency versions are used every run. To get that same guarantee locally (instead of
whatever Chromium build is installed on your machine) and avoid "works on my machine" drift, run the
suite inside the same image with Docker:

```powershell
# Windows PowerShell
docker run --rm --ipc=host -v "${PWD}:/work" -w /work mcr.microsoft.com/playwright:v1.62.0-noble `
  bash -c "npm ci && npm test"
```

```bash
# Linux / macOS
docker run --rm --ipc=host -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.62.0-noble \
  bash -c "npm ci && npm test"
```

The image tag (`v1.62.0-noble`) must match the `@playwright/test` version in `package.json` — bump both
together when upgrading Playwright.

---

## Deploy updates

Before first deploy, add these **repository or environment** variables (`Settings → Secrets and
variables → Actions → Variables`). Use **Secrets** only for actual credentials.

### Required (both environments)

- `WHATSAPP_NUMBER` — international format, no `+`/spaces (example: `31612345678`)
- `BRAND_NAME` — e.g. `Gato Catsit`
- `SITE_URL` — e.g. `https://gatoweb.nl` (production) / `https://staging.gatoweb.nl` (staging)
- `CONTACT_EMAIL`
- `CITY_NAME` — e.g. `'s-Hertogenbosch`
- `PRICE_ONE_VISIT`, `PRICE_TWO_VISITS`, `DOG_WALK_PRICE_FROM` — numeric
- `INSTAGRAM_HANDLE` — optional, without the `@` (defaults to `gatocatsit`); linked from the
  social CTA in the footer

### Optional (facturen/invoicing feature, issue #5)

- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — from the relevant Supabase project's API settings
- `BUSINESS_LEGAL_NAME`, `BUSINESS_ADDRESS`, `KVK_NUMBER`, `IBAN_NUMBER`, `BTW_EXEMPT` — printed on
  generated invoices when set; the invoice just omits those lines if unset
- `SEASONAL_SURCHARGE_PERCENT` — optional numeric percentage (default `0`) added to the unit price
  for booking days in July, August, December and January (issue #32)
- `PRICE_EXTRA_CAT_PER_DAY` — optional flat amount per day (default `0`) charged for each cat
  beyond the first one in the same booking. Unlike `SEASONAL_SURCHARGE_PERCENT`, this is also
  included in the public price estimate shown on the booking form (`layouts/index.html`), not just the
  final factuur, since it's known upfront

### Internal / infra

- `ENV_LABEL` — `production` or `staging`, drives the visible staging banner (`data-env` attribute)
- `CLOUDFLARE_ACCOUNT_ID` (repo variable) and `CLOUDFLARE_API_TOKEN` (repo **secret**) — used only
  by the staging deploy workflow

Notes:
- The site is built by `.github/actions/build-site` (shared by the production, staging and PR-preview
  workflows): it installs the pinned Hugo from `.github/actions/setup-hugo`, runs `hugo --gc --minify`
  into `site/`, then substitutes the placeholders and writes `site/js/config.js`.
- Language selection is no longer a runtime choice: Hugo renders `/en/`, `/nl/` and `/pt/` as separate
  pages, and `/` redirects based on `localStorage.gatoweb_lang` → browser language → English.
- Review count label is hardcoded in the site (`50+`).
- Placeholders like `__WHATSAPP_NUMBER__`, `__SITE_URL__`, `__ENV_LABEL__`, etc. are authored into
  `content/`, `layouts/`, `i18n/*.toml` and `static/{robots.txt,sitemap.xml,locales/*.json}`, and are
  substituted with `sed` over **every generated `.html`/`.json`/`.xml`/`.txt` file in `site/`** after
  the Hugo build. The build fails if any `__PLACEHOLDER__` survives that step.
  Values only needed by JavaScript (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BUSINESS_LEGAL_NAME`,
  `BUSINESS_ADDRESS`, `KVK_NUMBER`, `IBAN_NUMBER`, `BTW_EXEMPT`) are instead written into a
  generated `js/config.js` (`window.GATOWEB_CONFIG`) — see `static/js/config.js` for the committed
  defaults.
- `hugo.toml` keeps attribute quotes during minification, so an empty substituted value can never
  merge into the next attribute and corrupt the markup.

Changes go live automatically:
- push/merge to `staging` → deploys to `staging.gatoweb.nl` in ~1-2 minutes
- push/merge to `main` → deploys to `gatoweb.nl` in ~1-2 minutes

---

## Keeping Supabase awake (Free Tier)

Supabase may pause Free Plan projects after ~7 days of low database activity (this is a
discretionary heuristic, **not** a documented guarantee — the only official guarantee against
pausing is upgrading to Pro, see
[Production Checklist > Availability](https://supabase.com/docs/guides/deployment/going-into-prod#availability)).
Since staging (`gato-catsit-staging`) and production (`gato-catsit`) are separate Supabase
projects, each can pause independently.

`.github/workflows/keep-alive.yml` mitigates this with a daily (`workflow_dispatch`-triggerable)
ping to both projects: a real `POST /rest/v1/rpc/ping_keepalive` REST call using each
environment's `SUPABASE_URL`/`SUPABASE_ANON_KEY`, which performs a genuine write (`UPDATE`) against
a small dedicated `public.keepalive` table (`supabase/schema.sql`) — RLS-enabled, with `anon`
allowed only to `EXECUTE` the `SECURITY DEFINER` `ping_keepalive()` function (no direct table
grants) — rather than `bookings`/`staff_emails`, since the anon key can't (and shouldn't) write to
either of those. An earlier version of this ping used a plain `SELECT`, which kept succeeding
(HTTP 200) yet production still received a "scheduled to be paused" warning from Supabase (issue
#162) — a read-only ping does not reliably count as activity under Supabase's undocumented
low-activity heuristic, hence the write. The job fails loudly (not silently) on a non-2xx response
so a broken ping surfaces via GitHub's scheduled-workflow-failure email with enough runway before
the 7-day pause window. See issues #121 and #162 for the full rationale and accepted residual
risks (this is a best-effort mitigation, not a guaranteed fix).

---

## Facturen (invoices) feature

The invoicing dashboard (`/en/facturen/`, `/nl/facturen/`, `/pt/facturen/`, from
`layouts/facturen/list.html`) is a private page for Ligia, gated behind Supabase Auth — not linked
from the public site and marked `noindex,nofollow`:

- The public booking form (`layouts/index.html`) optionally saves a `pending` row to the Supabase
  `bookings` table (anon insert-only, see RLS policies in `supabase/schema.sql`). It also shows the
  client a live price estimate as soon as a start date is chosen, computed via the shared
  `buildInvoiceLineItems()` (`static/js/facturen/invoice-calc.js`) — the same logic used for the final
  factuur — including the flat extra-cat-per-day charge (`PRICE_EXTRA_CAT_PER_DAY`), but always
  excluding the seasonal surcharge, which only appears once Ligia issues the actual factuur.
- Ligia logs in (Supabase Auth) and sees all bookings sorted by what needs action: pending (needs
  approval) → approved but Tikkie not sent yet → done → cancelled.
- Approving a booking calls the `approve_booking()` Postgres function, which atomically assigns
  the next sequential invoice number (`factuur_number_seq`) and locks in the final amount.
- The invoice is a standalone A4-styled HTML document (`@page`/`@media print` CSS, no external
  library), opened in a new tab; Ligia prints it or uses the browser's "Save as PDF". It is always
  rendered in Dutch (`i18next.getFixedT('nl')`), regardless of the dashboard's current UI language,
  lists each service with its period/date range/frequency, and applies a seasonal surcharge
  (`SEASONAL_SURCHARGE_PERCENT`) to days in July, August, December and January.
- Tikkie payment requests are still sent manually by Ligia (no bank API integration); she just
  marks the booking as "Tikkie sent" once she's done.

To provision a Supabase project for this feature: create the project, run
`supabase/schema.sql` in its SQL editor, create an Auth user for the person who should have access,
then set the `SUPABASE_URL`/`SUPABASE_ANON_KEY` (and optional business detail) variables above.

---

## DNS Configuration (Namecheap)

`gatoweb.nl` is registered at Namecheap; DNS stays at the registrar (not proxied through
Cloudflare) — see [Tech Details](#tech-details) for why that matters for the staging setup.

### Production — GitHub Pages

1. **GitHub:** https://github.com/csguth/gatoweb.nl/settings/pages
   - Source: **GitHub Actions**
   - Custom domain: `gatoweb.nl`
   - Enforce HTTPS: ✅ (after DNS propagates)
2. **Namecheap DNS records:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | `185.199.108.153` | Automatic |
| A Record | @ | `185.199.109.153` | Automatic |
| A Record | @ | `185.199.110.153` | Automatic |
| A Record | @ | `185.199.111.153` | Automatic |
| CNAME Record | www | `csguth.github.io.` | Automatic |

### Staging — Cloudflare Pages

1. Cloudflare Pages project `gatoweb-nl-staging` (production branch: `staging`) has the custom
   domain `staging.gatoweb.nl` attached.
2. **Namecheap DNS record:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME Record | staging | `gatoweb-nl-staging.pages.dev` | Automatic |

DNS propagation: 5-60 minutes.

---

## Content Overview

- **Brand name:** Gato Catsit
- **WhatsApp:** configured via `WHATSAPP_NUMBER` variable (not stored in repo)
- **Location:** 's-Hertogenbosch
- **Experience:** 12+ years
- **Reviews:** 50+ five-star (from Pawshake)
- **Languages:** English / Nederlands in static HTML, plus Portuguese support for JS runtime strings
- **Booking:** WhatsApp form (dates, pets, preference) + optional Supabase persistence

---

## Tech Details

- **Two-layer i18n:** static page copy is resolved at **build time** by Hugo from `i18n/{en,nl,pt}.toml`
  (`{{ i18n "key" }}`); only the strings JavaScript builds at runtime (booking messages, invoice line
  items, auth errors) still go through i18next and `static/locales/{en,nl,pt}.json` (`static/js/i18n.js`)
- **Static key naming:** compile-time keys keep the `static.<page>.<section>.<slug>` shape
  (e.g. `static.index.hero.book_a_visit`), grouped by page section (`hero`, `about`, `services`,
  `reviews`, `booking`, `footer`, `nav`, `misc`, …) so they stay readable and stable even if markup is
  reordered. They're quoted in the TOML files because they contain dots, which TOML would otherwise
  read as nested tables
- **Auto-detection:** only at `/` — `static/js/root-redirect.js` picks saved preference → browser
  language → English, then redirects to `/en/`, `/nl/` or `/pt/`
- **Persistence:** `static/js/lang-persist.js` writes the current page's `<html lang>` into
  `localStorage.gatoweb_lang` on every load (shared across all pages)
- **Translation check:** run `node scripts/i18n-check.mjs` to validate that every `{{ i18n "…" }}` key
  used in `layouts/` exists in all three `i18n/*.toml` files, and every static `t('…')` key used in
  `static/js/` exists in all three `static/locales/*.json` files
- **Contrast check:** `hugo --gc --minify --destination site && node scripts/preview-fill.mjs`, serve
  `site/` (e.g. `npx http-server site -p 8913`), then run
  `node scripts/contrast-audit.mjs http://127.0.0.1:8913` to check every rendered page for WCAG AA
  contrast failures. Text sitting on a photo is listed separately for a visual check rather than
  failing the run, since its real backdrop isn't a single colour
- **Alpine directives use a `data-x-` prefix** (`data-x-data`, `data-x-on:click`, `data-x-bind:class`)
  registered via `Alpine.prefix('data-x-')` in `layouts/partials/head.html`, so every directive is a
  valid HTML5 `data-*` attribute and the pages pass the W3C checker
- **Booking form:** `localStorage.gatoweb_booking` saves pets/preference (not dates). A separate `localStorage.gatoweb_pending_booking` key (issue #95) stashes a FULL booking (incl. dates) when signup requires email confirmation, so it can be resumed and sent automatically once the client confirms and returns with a session — instead of losing the in-progress request
- **Colors:** `brand.*` Tailwind palette from Lígia's Canva design system (issues #137 / #149) —
  `brand-ink` (`#3D0C11`), `brand-plum`, `brand-wine`, `brand-crimson`, `brand-red` (`#B83C4E`),
  `brand-blush`, `brand-rose`, `brand-cream` (`#F4F1EA`), `brand-sand`, `brand-moss`, `brand-grey`.
  Each token is annotated with its role in the design in `static/js/tailwind-config.js`. Status
  colours (error red, success green, warning amber) stay on Tailwind's defaults — they're semantic,
  not brand
- **Fonts:** Anton (`font-display`, headings) + Nunito (`font-sans`, body), both SIL OFL and
  **self-hosted** from `static/fonts/` — no Google Fonts CDN. They stand in for the Canva fonts in
  the design ("Extend 50 Mega" and "Bubblebody Neue"), which can't be licensed for use on a
  self-hosted site. Refresh the woff2 subsets with `node scripts/fetch-fonts.mjs`
- **Icons:** the hand-drawn set from the same design (issue #139) lives in `static/images/icons/`
  and is rendered by `{{ partial "icon.html" (dict "name" "cat-head" "class" "w-6 h-6") }}`. They
  replaced the emojis the UI used to carry — "Visit preference", the pricing cards, "How it works",
  the footer. Icons are **decorative**: the partial emits `alt="" aria-hidden="true"`, so the label
  next to them is what screen readers announce. The artwork is dark linework, so on the dark
  sections it sits in a `brand-red` circle, the way the design does it. Regenerate the set from
  Canva with `python scripts/canva-icons.py` (see the script's header)
- **Staging banner:** pure CSS, no JS — `body[data-env="staging"] #env-banner { display: block; }`,
  with `data-env` substituted at build time from the `ENV_LABEL` variable
- **Why two Cloudflare Pages projects for one repo:** Cloudflare Pages only supports a custom
  domain on a non-production branch if the zone's DNS is proxied through Cloudflare. Since
  `gatoweb.nl` DNS stays at Namecheap, staging uses its own dedicated Cloudflare Pages project
  (`gatoweb-nl-staging`, production branch = `staging`) with its own custom domain instead of a
  branch alias on a single project.

---

## SEO Assets

- **Canonical URL:** one per language — `https://gatoweb.nl/en/`, `/nl/`, `/pt/`
- **hreflang:** every public page links to all three languages plus `x-default` → `https://gatoweb.nl/`
- **Open Graph/Twitter cards:** configured in `layouts/partials/head.html`, with `og:locale` and
  `og:locale:alternate` per language
- **Favicon:** `static/images/favicon.png`
- **Robots:** `static/robots.txt` — deliberately does not enumerate the private pages (see
  [URLs and languages](#urls-and-languages))
- **Sitemap:** `static/sitemap.xml` — hand-written (Hugo's generated one is disabled) so it can carry
  the `__SITE_URL__` placeholder; lists all three language homepages with hreflang annotations

---

## Production Checklist

- [ ] Confirm required variables are set for both `github-pages` (or repo-level) and `staging` GitHub Environments
- [ ] Check homepage title/description preview in social share debuggers (share `https://gatoweb.nl/` — the root redirect carries its own OG tags)
- [ ] Verify `https://gatoweb.nl/robots.txt` returns 200
- [ ] Verify `https://gatoweb.nl/sitemap.xml` returns 200
- [ ] Verify WhatsApp links work in hero, floating button and booking form
- [ ] Verify `https://gatoweb.nl/` redirects to `/en/`, `/nl/` or `/pt/` per browser language, and that the choice sticks on the next visit
- [ ] Verify the legacy `https://gatoweb.nl/facturen.html` and `/account.html` still land on the right page
- [ ] Confirm the Supabase project's *Redirect URLs* allowlist covers the language-prefixed paths (`https://gatoweb.nl/**`)
- [ ] Confirm HTTPS lock appears for `gatoweb.nl`, `www.gatoweb.nl` and `staging.gatoweb.nl`
- [ ] Confirm the staging banner is visible on staging and hidden on production

### Performance note

The site currently uses Tailwind Play CDN (`cdn.tailwindcss.com`) for simplicity. This is fine for
now, but for best performance and to remove browser warnings, migrate later to a small precompiled
CSS build.

---

## Updating Content

Page **markup** lives in `layouts/` (`index.html`, `account/list.html`, `facturen/list.html`); the
**text** lives in `i18n/{en,nl,pt}.toml`. To change a piece of copy, find its key in the layout
(`{{ i18n "static.index.hero.book_a_visit" }}`) and edit that key in all three TOML files. Adding a
new string means adding both the `{{ i18n "…" }}` call and the key in every language —
`node scripts/i18n-check.mjs` fails if one is missing.

Key search terms:

- **Prices** → search for `€` in `layouts/` (the numbers themselves come from the `PRICE_*` variables)
- **Reviews** → `#reviews` section in `layouts/index.html`, text under `static.index.reviews.*`
- **WhatsApp message** → search for `wa.me/` in `layouts/index.html`
- **Trust bar stats** → search for `5.000+`, `50+`, `21` in `layouts/index.html`
- **Brand name** → `__BRAND_NAME__` (substituted at deploy time from the `BRAND_NAME` variable)
- **Page titles/descriptions** → `content/**/_index.{en,nl,pt}.md` front matter

---

## Full flow summary

```
Client visits gatoweb.nl
        ↓
Clicks "Book a visit"
        ↓
WhatsApp message opens with pre-filled request (+ optional Supabase record)
        ↓
Ligia confirms availability manually
        ↓
Ligia opens the facturen dashboard, approves the booking (assigns invoice number, generates PDF)
        ↓
Ligia sends the Tikkie payment request manually and marks it as sent
```

---

## Roadmap / open work

Tracked on the [project board](https://github.com/csguth/gatoweb.nl/projects) and in issues:

- Issue #6 — Google Calendar auto-reminders (tentative event on booking, confirmed on invoice approval)
- Issue #7 — Production cutover from GitHub Pages to Cloudflare Pages: deferred, needs an explicit
  decision on how to handle the apex domain (`gatoweb.nl` itself needs a full Cloudflare zone/nameserver
  migration to get a Cloudflare Pages custom domain, unlike the `staging` subdomain)
