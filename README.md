# gatoweb.nl — Gato Petsit

Professional catsitting service by Lígia in 's-Hertogenbosch.

## Stack (zero build process, all free/cheap)

| Tool | Purpose | Cost |
|---|---|---|
| Plain HTML + Tailwind CDN | Website | Free |
| Alpine.js CDN | EN/NL bilingual toggle, booking form, facturen dashboard | Free |
| Supabase | Bookings database + Auth (facturen feature) | Free tier |
| jsPDF (CDN) | Client-side invoice PDF generation | Free |
| WhatsApp | Direct booking / confirmation | Free |
| GitHub Pages | Production hosting + HTTPS (`gatoweb.nl`) | Free |
| Cloudflare Pages | Staging hosting (`staging.gatoweb.nl`) | Free |
| **gatoweb.nl** | Custom domain (registrar: Namecheap) | ~€12/year |

**Monthly cost: €0** (just the domain renewal once a year)

---

## Repository structure

```
index.html          Public landing page (bilingual EN/NL)
facturen.html        Private invoicing dashboard for Ligia (Supabase Auth, not indexed by search engines)
supabase/schema.sql  Database schema: bookings table, RLS policies, approve_booking() function
robots.txt, sitemap.xml
CNAME                GitHub Pages custom domain config
images/              Favicon and other static assets
.github/workflows/
  deploy-pages.yml               Production deploy -> GitHub Pages (push to main)
  deploy-staging-cloudflare.yml  Staging deploy -> Cloudflare Pages (push to staging)
  guard-main-merges.yml          Enforces the staging -> main promotion order (see below)
```

---

## Features

✅ **Bilingual** — Auto-detects browser language (EN/NL), manual toggle, persisted in localStorage
✅ **Real reviews** — 50+ five-star reviews from Pawshake (3 EN + 3 NL)
✅ **WhatsApp booking** — Direct message with pre-filled dates/pets/preference
✅ **Booking persistence** — Booking form also saves an optional record to Supabase (`bookings` table) when configured
✅ **Facturen (invoices) dashboard** — `facturen.html`, private page for Ligia: Supabase Auth login, lists all bookings sorted by what needs action (approve → send Tikkie → done), generates a PDF invoice client-side with a sequential invoice number
✅ **Responsive** — Mobile-first design with Tailwind CSS
✅ **SEO optimized** — Meta tags, canonical, Open Graph/Twitter cards, robots.txt, sitemap.xml
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
| Supabase project | `gato-petsit` | `gato-petsit-staging` |
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
- `staging` has no required status checks yet since there's no automated test suite — once tests
  are added, mark their job as a required check on `staging`'s branch protection.

---

## Deploy updates

Before first deploy, add these **repository or environment** variables (`Settings → Secrets and
variables → Actions → Variables`). Use **Secrets** only for actual credentials.

### Required (both environments)

- `WHATSAPP_NUMBER` — international format, no `+`/spaces (example: `31612345678`)
- `BRAND_NAME` — e.g. `Gato Petsit`
- `SITE_URL` — e.g. `https://gatoweb.nl` (production) / `https://staging.gatoweb.nl` (staging)
- `CONTACT_EMAIL`
- `CITY_NAME` — e.g. `'s-Hertogenbosch`
- `PRICE_ONE_VISIT`, `PRICE_TWO_VISITS`, `DOG_WALK_PRICE_FROM` — numeric

### Optional (facturen/invoicing feature, issue #5)

- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — from the relevant Supabase project's API settings
- `BUSINESS_LEGAL_NAME`, `BUSINESS_ADDRESS`, `KVK_NUMBER`, `IBAN_NUMBER`, `BTW_EXEMPT` — printed on
  generated invoices when set; the PDF just omits those lines if unset

### Internal / infra

- `ENV_LABEL` — `production` or `staging`, drives the visible staging banner (`data-env` attribute)
- `CLOUDFLARE_ACCOUNT_ID` (repo variable) and `CLOUDFLARE_API_TOKEN` (repo **secret**) — used only
  by the staging deploy workflow

Notes:
- Language default is hardcoded: browser language detection (`nl` → Dutch) with fallback to
  English, or previous user choice saved in localStorage.
- Review count label is hardcoded in the site (`50+`).
- Placeholders like `__WHATSAPP_NUMBER__`, `__SITE_URL__`, `__ENV_LABEL__`, etc. in `index.html`,
  `facturen.html`, `robots.txt` and `sitemap.xml` are substituted with `sed` at deploy time — see
  the "Build site with injected variables" step in each workflow.

Changes go live automatically:
- push/merge to `staging` → deploys to `staging.gatoweb.nl` in ~1-2 minutes
- push/merge to `main` → deploys to `gatoweb.nl` in ~1-2 minutes

---

## Facturen (invoices) feature

`facturen.html` is a private dashboard for Ligia, gated behind Supabase Auth (not linked from the
public site, disallowed in `robots.txt`):

- Public booking form (`index.html`) optionally saves a `pending` row to the Supabase `bookings`
  table (anon insert-only, see RLS policies in `supabase/schema.sql`).
- Ligia logs in (Supabase Auth) and sees all bookings sorted by what needs action: pending (needs
  approval) → approved but Tikkie not sent yet → done → cancelled.
- Approving a booking calls the `approve_booking()` Postgres function, which atomically assigns
  the next sequential invoice number (`factuur_number_seq`) and locks in the final amount.
- A PDF invoice is generated client-side with jsPDF and can be re-downloaded anytime.
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

- **Brand name:** Gato Petsit
- **WhatsApp:** configured via `WHATSAPP_NUMBER` variable (not stored in repo)
- **Location:** 's-Hertogenbosch
- **Experience:** 12+ years
- **Reviews:** 50+ five-star (from Pawshake)
- **Languages:** English / Nederlands (auto-detected + manual toggle)
- **Booking:** WhatsApp form (dates, pets, preference) + optional Supabase persistence

---

## Tech Details

- **Bilingual system:** CSS-based (`index.html`: `.en`/`.nl` classes; `facturen.html`: `.en-l`/`.nl-l`
  classes, to avoid clashing if the files are ever merged), toggled via `body.show-nl`
- **Auto-detection:** `navigator.language.startsWith('nl')` → defaults to NL
- **Persistence:** Language choice saved in `localStorage.gatoweb_lang` (shared across both pages)
- **Booking form:** `localStorage.gatoweb_booking` saves pets/preference (not dates)
- **Colors:** Custom Tailwind palette (sage-600: `#2d5a4b`, warm-500: `#c97d60`)
- **Fonts:** Playfair Display (serif) + Inter (sans-serif)
- **Staging banner:** pure CSS, no JS — `body[data-env="staging"] #env-banner { display: block; }`,
  with `data-env` substituted at build time from the `ENV_LABEL` variable
- **Why two Cloudflare Pages projects for one repo:** Cloudflare Pages only supports a custom
  domain on a non-production branch if the zone's DNS is proxied through Cloudflare. Since
  `gatoweb.nl` DNS stays at Namecheap, staging uses its own dedicated Cloudflare Pages project
  (`gatoweb-nl-staging`, production branch = `staging`) with its own custom domain instead of a
  branch alias on a single project.

---

## SEO Assets

- **Canonical URL:** `https://gatoweb.nl/`
- **Open Graph/Twitter cards:** configured in `<head>`
- **Favicon:** `images/favicon.png`
- **Robots:** `robots.txt` (disallows `/facturen.html`)
- **Sitemap:** `sitemap.xml`

---

## Production Checklist

- [ ] Confirm required variables are set for both `github-pages` (or repo-level) and `staging` GitHub Environments
- [ ] Check homepage title/description preview in social share debuggers
- [ ] Verify `https://gatoweb.nl/robots.txt` returns 200
- [ ] Verify `https://gatoweb.nl/sitemap.xml` returns 200
- [ ] Verify WhatsApp links work in hero, floating button and booking form
- [ ] Verify EN/NL auto-detection and manual toggle persistence
- [ ] Confirm HTTPS lock appears for `gatoweb.nl`, `www.gatoweb.nl` and `staging.gatoweb.nl`
- [ ] Confirm the staging banner is visible on staging and hidden on production

### Performance note

The site currently uses Tailwind Play CDN (`cdn.tailwindcss.com`) for simplicity. This is fine for
now, but for best performance and to remove browser warnings, migrate later to a small precompiled
CSS build.

---

## Updating Content

All public content is in `index.html`; the invoicing dashboard is in `facturen.html`. Key search terms:

- **Prices** → search for `€`
- **Reviews** → search for `#reviews` section
- **WhatsApp message** → search for `'Hi Lígia!`
- **Trust bar stats** → search for `5.000+`, `50+`, `21`
- **Brand name** → search for `Gato Petsit`

EN text: `<span class="en">` or `<p class="en">` (index.html) / `.en-l` (facturen.html)
NL text: `<span class="nl">` or `<p class="nl">` (index.html) / `.nl-l` (facturen.html)

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
Ligia opens facturen.html, approves the booking (assigns invoice number, generates PDF)
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
