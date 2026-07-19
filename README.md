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
✅ **SEO optimized** — Meta tags, semantic HTML, fast load  

---

## Deployment

**Live site:** https://gatoweb.nl (GitHub Pages)  
**Repository:** https://github.com/csguth/gatoweb.nl

### Deploy updates

Before first deploy, add this repository variable:

- `WHATSAPP_NUMBER` = WhatsApp number in international format without `+` or spaces (example: `31612345678`)

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
