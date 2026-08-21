# JobPilot Africa — Landing Page

A single-page, mobile-first marketing site for JobPilot Africa. Static HTML/CSS/JS — no build step, no dependencies.

## Files

- `index.html` — page structure and content
- `styles.css` — all styling (brand colors, layout, responsive breakpoints)
- `script.js` — mobile nav toggle, category grid rendering, scroll-reveal animations, footer year

## Links used on the page

- Telegram bot: https://t.me/JobPilot_Africa_Bot
- Telegram channel: https://t.me/jobpilotafrica
- WhatsApp: https://wa.me/2347057349954 (0705 734 9954)
- TikTok: https://www.tiktok.com/@jobpilot_africa

If any of these change, update them in `index.html` (they appear in the header, hero, mid-page CTA, final CTA, and footer).

## Previewing locally

No build tools needed. Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploying to Vercel

**Option A — Vercel CLI (fastest)**

```bash
npm install -g vercel
cd jobpilot-landing
vercel
```

Follow the prompts (link/create a project, accept defaults — it's a static site, so no build command or output directory is needed). Vercel will give you a live URL immediately, and a production URL after `vercel --prod`.

**Option B — GitHub + Vercel dashboard**

1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com/new and import the repo.
3. Framework preset: "Other" (static site) — leave build command and output directory blank.
4. Deploy. Vercel gives you a `*.vercel.app` URL, and you can attach a custom domain (e.g. `jobpilotafrica.com`) under Project Settings → Domains.

## Customizing

- **Brand colors** are defined as CSS variables at the top of `styles.css` (`:root { --navy, --green, --gold, ... }`) — change them there and they apply everywhere.
- **Category list / role counts** are in the `categories` array near the top of `script.js`.
- **Copy** (headlines, section text) lives directly in `index.html`.
