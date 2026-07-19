# gatoweb.nl — Gato Petsit

Professional catsitting service by Lígia in 's-Hertogenbosch.

## Stack (zero build process, all free)

| Tool | Purpose | Cost |
|---|---|---|
| Plain HTML + Tailwind CDN | Website | Free |
| Alpine.js CDN | EN/NL bilingual toggle + localStorage | Free |
| WhatsApp | Direct booking | Free |
| GitHub Pages | Hosting + HTTPS | Free |
| **gatoweb.nl** | Custom domain | ~€12/year |

**Monthly cost: €0** (just the domain renewal once a year)

---

## Features

✅ **Bilingual** — Auto-detects browser language (EN/NL), manual toggle, persisted in localStorage  
✅ **Real reviews** — 50+ five-star reviews from Pawshake (3 EN + 3 NL)  
✅ **WhatsApp booking** — Direct message with pre-filled dates/pets/preference  
✅ **Responsive** — Mobile-first design with Tailwind CSS  
✅ **SEO optimized** — Meta tags, canonical, Open Graph/Twitter cards, robots.txt, sitemap.xml  

---

## Deployment

**Live site:** https://gatoweb.nl (GitHub Pages)  
**Repository:** https://github.com/csguth/gatoweb.nl

### Deploy updates

Before first deploy, add these repository/environment variables:

- `WHATSAPP_NUMBER` = WhatsApp number in international format without `+` or spaces (example: `31612345678`)
- `BRAND_NAME` = `Gato Petsit`
- `SITE_URL` = `https://gatoweb.nl`
- `CONTACT_EMAIL` = `gatopetsit@gmail.com`
- `CITY_NAME` = `'s-Hertogenbosch`
- `PRICE_ONE_VISIT` = `18`
- `PRICE_TWO_VISITS` = `28`
- `DOG_WALK_PRICE_FROM` = `18`

Notes:
- Language default is hardcoded: browser language detection (`nl` -> Dutch) with fallback to English, or previous user choice saved in localStorage.
- Review count label is hardcoded in the site (`50+`).

GitHub: `Settings -> Secrets and variables -> Actions -> Variables -> New repository variable`

Use **Secrets** only for credentials (API keys, tokens, passwords).

```bash
cd "C:\Users\Chrystian Guth\Documents\gatoweb-nl"
git add .
git commit -m "Update content"
git push origin main
```

Changes go live in ~1-2 minutes via GitHub Actions.

---

## DNS Configuration (Namecheap)

### GitHub Pages Setup

1. **GitHub:** https://github.com/csguth/gatoweb.nl/settings/pages
        - Source: **GitHub Actions**
   - Custom domain: `gatoweb.nl`
   - Enforce HTTPS: ✅ (after DNS propagates)

2. **Namecheap:** https://ap.www.namecheap.com/domains/domaincontrolpanel/gatoweb.nl/advancedns
   - Add these records (remove any conflicting ones):

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | `185.199.108.153` | Automatic |
| A Record | @ | `185.199.109.153` | Automatic |
| A Record | @ | `185.199.110.153` | Automatic |
| A Record | @ | `185.199.111.153` | Automatic |
| CNAME Record | www | `csguth.github.io.` | Automatic |

DNS propagation: 5-60 minutes.

---

## Content Overview

- **Brand name:** Gato Petsit
- **WhatsApp:** configured via repository variable `WHATSAPP_NUMBER` (not stored in repo)
- **Location:** 's-Hertogenbosch
- **Experience:** 12+ years
- **Reviews:** 50+ five-star (from Pawshake)
- **Languages:** English / Nederlands (auto-detected + manual toggle)
- **Booking:** WhatsApp form (dates, pets, preference)

---

## Tech Details

- **Bilingual system:** CSS-based (`.en` / `.nl` classes, toggled via `body.show-nl`)
- **Auto-detection:** `navigator.language.startsWith('nl')` → defaults to NL
- **Persistence:** Language choice saved in `localStorage.gatoweb_lang`
- **Booking form:** `localStorage.gatoweb_booking` saves pets/preference (not dates)
- **Colors:** Custom Tailwind palette (sage-600: `#2d5a4b`, warm-500: `#c97d60`)
- **Fonts:** Playfair Display (serif) + Inter (sans-serif)

---

## SEO Assets

- **Canonical URL:** `https://gatoweb.nl/`
- **Open Graph/Twitter cards:** configured in `<head>`
- **Favicon:** `images/favicon.png`
- **Robots:** `robots.txt`
- **Sitemap:** `sitemap.xml`

---

## Production Checklist

- [ ] Confirm `WHATSAPP_NUMBER` variable is set in GitHub Actions
- [ ] Check homepage title/description preview in social share debuggers
- [ ] Verify `https://gatoweb.nl/robots.txt` returns 200
- [ ] Verify `https://gatoweb.nl/sitemap.xml` returns 200
- [ ] Verify WhatsApp links work in hero, floating button and booking form
- [ ] Verify EN/NL auto-detection and manual toggle persistence
- [ ] Confirm HTTPS lock appears for `gatoweb.nl` and `www.gatoweb.nl`

### Performance note

The site currently uses Tailwind Play CDN (`cdn.tailwindcss.com`) for simplicity. This is fine for now, but for best performance and to remove browser warnings, migrate later to a small precompiled CSS build.

---

## Updating Content

All content is in `index.html` (single file). Key search terms:

- **Prices** → search for `€`
- **Reviews** → search for `#reviews` section
- **WhatsApp message** → search for `'Hi Lígia!`
- **Trust bar stats** → search for `5.000+`, `50+`, `21`
- **Brand name** → search for `Gato Petsit`

EN text: `<span class="en">` or `<p class="en">`  
NL text: `<span class="nl">` or `<p class="nl">`

---

## Full flow summary

```
Client visits gatoweb.nl
        ↓
Clicks "Book a visit"
        ↓
WhatsApp message opens with pre-filled request
        ↓
Lígia confirms availability manually
```
