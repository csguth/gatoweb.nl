# gatoweb.nl — Lígia Catsitting

Front page for Lígia's professional catsitting service in 's-Hertogenbosch.

## Stack (zero build process, all free)

| Tool | Purpose | Cost |
|---|---|---|
| Plain HTML + Tailwind CDN | Website | Free |
| Alpine.js CDN | EN/NL language toggle | Free |
| **Cal.com** | Online booking calendar | Free |
| Google Calendar | Calendar backend | Free |
| Netlify | Hosting + HTTPS | Free |
| **gatoweb.nl** | Custom domain | ~€12/year |

**Monthly cost: €0** (just the domain renewal once a year)

---

## Checklist before going live

- [ ] Add WhatsApp number (step 1)
- [ ] Set up Cal.com booking calendar (step 2)
- [ ] Connect Google Calendar → iPhone (step 3)
- [ ] Add 3 real review quotes from Pawshake (step 4)
- [ ] Deploy to Netlify (step 5)
- [ ] Connect gatoweb.nl domain (step 6)

---

## Step 1 — Add WhatsApp number

Search for `31XXXXXXXXX` in `index.html` (3 occurrences) and replace with the real number.

WhatsApp number format: country code + number, no `+` or spaces.

**Example:** Dutch number `06 12 34 56 78` → `31612345678`

---

## Step 2 — Set up Cal.com (booking calendar)

Cal.com is free, open source, and syncs with Google Calendar.

1. Go to **https://cal.com** → Create a free account
2. Create an **Event Type**:
   - Name: `Catsitting Visit` (or `Huisbezoek`)
   - Duration: 30 min
   - Location: `In-person (will travel to you)` → enter 's-Hertogenbosch
   - Add a description and price if you want
3. Create a second event for `2 Home Visits / day` if needed
4. In **Settings → Calendars** → Connect your Google Calendar
5. Set your **availability** (working days and hours)

### Embed the calendar in the website

In `index.html`, find the `<!-- PLACEHOLDER -->` block in the `#booking` section and replace it with:

```html
<div id="my-cal-inline" style="width:100%;min-height:600px;overflow:scroll"></div>
<script type="text/javascript">
  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal; let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {}; cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", { origin: "https://app.cal.com" });
  Cal("inline", {
    elementOrSelector: "#my-cal-inline",
    calLink: "YOUR_USERNAME/catsitting-visit",  // ← replace this
  });
  Cal("ui", {
    theme: "light",
    styles: { branding: { brandColor: "#2d5a4b" } },
    hideEventTypeDetails: false,
  });
</script>
```

Replace `YOUR_USERNAME` with the Cal.com username chosen at signup.

---

## Step 3 — Google Calendar → iPhone sync

This is the key step. Once Cal.com is connected to Google Calendar, every booking automatically appears there. Then:

**Option A (easiest):** Install the **Google Calendar app** on iPhone, sign in with the same Google account. Done — all bookings appear in the app.

**Option B (native):** Add Google Calendar to the iPhone's built-in Calendar app:
1. iPhone → **Settings** → **Calendar** → **Accounts** → **Add Account**
2. Choose **Google** → Sign in
3. Enable **Calendars** → Save

All bookings from Cal.com → Google Calendar → iPhone Calendar app, automatically.

---

## Step 4 — Add real review quotes

Open `index.html` and search for:
```
"Paste a real review from your Pawshake profile here."
```

Replace each occurrence (EN and NL) with a real review copied from:
https://www.pawshake.nl/sitter/7340211#sitter-reviews

You can also add the reviewer's first name to the `— 's-Hertogenbosch` line.

---

## Step 5 — Deploy to Netlify (free)

### Option A: Drag & drop (no GitHub needed)

1. Go to **https://netlify.com** → Sign up free
2. On the dashboard, drag & drop the entire `gatoweb-nl` folder
3. Done — you'll get a URL like `https://happy-cat-123456.netlify.app`

### Option B: Deploy from GitHub (auto-deploys on every push)

1. Create a free account at **https://github.com**
2. Create a new repository (private is fine)
3. Upload the `gatoweb-nl` folder to the repository
4. In Netlify: **Add new site → Import from Git** → connect GitHub → select repo
5. Leave all settings default → **Deploy**

Every time you edit `index.html` and push to GitHub, the site updates automatically.

---

## Step 6 — Connect gatoweb.nl domain

1. In Netlify: **Site Settings → Domain Management → Add custom domain**
2. Enter `gatoweb.nl` → **Verify**
3. Netlify will show the DNS records to add (usually 2 lines)
4. Go to your domain registrar (Transip, Hostnet, etc.) → DNS settings
5. Add the records Netlify shows
6. Wait ~15 minutes → HTTPS is auto-configured by Netlify (free Let's Encrypt)

---

## Updating the website

All content is in `index.html`. It's a single file — just open it in any text editor.

- **Prices** → search for `€18` or `€28`
- **Email** → search for `gatopetsit@gmail.com`
- **WhatsApp** → search for `31XXXXXXXXX`
- **Reviews** → search for `"Paste a real review`
- **Cal.com link** → search for `YOUR_USERNAME`

EN text is always in `<span class="en">` or `<p class="en">`.  
NL text is always in `<span class="nl">` or `<p class="nl">`.

---

## Profile photos

The site currently loads photos directly from Pawshake's CDN. This works fine, but for long-term reliability it's better to download them and host locally:

1. Right-click each image on the Pawshake profile → Save image
2. Create an `images/` folder inside `gatoweb-nl/`
3. Place the photos there and update the `src=` paths in `index.html`

Photos used:
- Profile: `llbt1h3ybbpfa8voucmbiqu4.jpg`
- Gallery: `awknub7cgrxkadhlkn9rz3gl.jpg`, `id2BXxb-zScHHSQoxN-BNMDCsb4.jpeg`, `diOMcWJUEChu6jwnRb9cLH3K33s.jpeg`, `OPJMj-Nt60cHZIAkxAkvkFnY3Io.jpg`

---

## Full flow summary

```
Client visits gatoweb.nl
        ↓
Clicks "Book a visit"
        ↓
Cal.com calendar (embedded in page)
        ↓
Client picks date & time
        ↓
Booking confirmed → email to gatopetsit@gmail.com
        ↓
Google Calendar updated automatically
        ↓
iPhone Calendar updated automatically (via Google sync)
```
