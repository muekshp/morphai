# Morph AI — Website (Next.js 16 + TypeScript)

Virtual Try-On API website for fashion e-commerce. Converted from the static
VamTam page-builder build to a proper **Next.js 16 App Router + TypeScript**
project with **zero visual changes** — same markup, same CSS, same images,
same behaviour (carousels, menus, forms, accordions, animations).

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production (self-contained `output: standalone`):

```bash
npm run build      # builds + copies static/ & public/ into the standalone root
npm run start      # NODE_ENV=production node .next/standalone[/morph]/server.js
```

> Next.js 16 emits the standalone server either at
> `.next/standalone/server.js` or nested at `.next/standalone/morph/server.js`
> depending on layout. The `build` script auto-detects it and copies
> `.next/static` + `public/` next to `server.js`, which is required for
> CSS/JS/images to be served in production.

Other scripts: `npm run lint` (ESLint), `npm run typecheck` (strict `tsc --noEmit`).

## Form emails (Contact + Book a Free Demo)

Both website forms are fully wired: when a visitor submits, the original
form widget posts to `/api/forms` (Next.js API route), which

1. sends the visitor a friendly branded confirmation email, and
2. sends the site owner a lead notification (reply-to the visitor),
3. appends every lead to `leads.jsonl` as a durable backup.

Setup uses **Google SMTP** and only needs three values in `.env`
(copy `.env.example` → `.env`, fill, then restart the server —
`npm run build && npm start`, or however you launch it):

```dotenv
SMTP_USER=yourgmail@gmail.com      # sending account (also the SMTP login)
SMTP_PASS=your-16-char-app-password # Google Account > Security >
                                   # 2-Step Verification > App Passwords
OWNER_EMAIL=you@gmail.com          # inbox that receives the leads
```

Optional overrides (preconfigured for Gmail): `SMTP_HOST` (smtp.gmail.com),
`SMTP_PORT` (465), `SMTP_SECURE` (auto), `SMTP_DRY_RUN=true` (log emails
instead of sending — handy for testing), `PUBLIC_SITE_URL`.

Until `.env` is filled in, submissions still succeed, every lead is stored
in `leads.jsonl` next to the server, and the server log prints a setup
reminder. The visitor-facing success message, the button spinner and the
form reset all come from the site's own original form JavaScript, so the
UX is exactly the original design. Submissions are rate-limited to
5 per 10 minutes per IP.

## Routes

| Route | Page | Title |
|-------|------|-------|
| / | Home | Morph AI — Virtual Try-On API for Fashion E-commerce |
| /services | Services | Services — Morph AI |
| /about | About | About — Morph AI |
| /contact | Contact | Contact — Morph AI |
| /book-a-discovery-call | Book a Free Demo | Book a Free Demo — Morph AI |

Each route lives in its own route group (`src/app/(home)`, `(services)`, …)
so every page keeps its **original `<body>` class list** — the page CSS
(`post-XX.css`) targets `body.morph-page-XX`.

## Project structure

```
src/
├── app/
│   ├── (home)/                      root layout + page for /
│   ├── (services)/services/         root layout + page for /services
│   ├── (about)/about/               root layout + page for /about
│   ├── (contact)/contact/           root layout + page for /contact
│   └── (book)/book-a-discovery-call/
├── components/
│   ├── RootShell.tsx                <html>/<body> shell + head resources
│   └── SitePage.tsx                 bootstrap + page content renderer
├── data/pages/*.json                extracted page payloads (markup)
├── lib/
│   ├── bootstrap.ts                 script bootstrap (see below)
│   ├── env.ts                       runtime .env loader (standalone-safe)
│   ├── mailer.ts                    SMTP transport + email templates
│   ├── pageData.ts                  typed access to page payloads
│   └── types.ts                     PageData types
└── styles/morph.css                 layout-transparent wrapper rule
public/                              css/ js/ images/ fonts/ (unchanged)
```

## How the original markup is served

- `src/data/pages/*.json` holds each page's full original `<body>` markup
  with internal links rewritten to Next routes (`services.html` → `/services`)
  and asset URLs made absolute.
- `<SitePage />` renders it through `dangerouslySetInnerHTML` on a wrapper
  div with `display: contents` — layout-invisible, so the original CSS
  renders exactly as before.
- Original `<head>` stylesheets + inline styles are rendered in order with
  a shared `precedence`, which React 19 hoists into `<head>` **preserving
  cascade order**.

## How the original scripts are loaded

The theme's scripts (jQuery, the page-builder runtime, VamTam, swiper, …)
are shipped as **inert placeholders** (`<script data-morph-inert …>`) inside
the markup. `src/lib/bootstrap.ts` (the only inline script rendered by React):

1. freezes `document.readyState` as `'loading'`,
2. on the real `DOMContentLoaded`, materializes every placeholder into a
   real `<script>` element **in original order** (sequential await), and
3. restores `readyState` and dispatches `DOMContentLoaded`.

This reproduces the static site's exact load semantics and — crucially —
keeps the scripts **outside React's hydration tree**: React 19 re-creates
tree-rendered `<script>` elements during hydration, which re-executes them
and corrupts the runtime state (fresh jQuery instance, reset webpack chunk
caches, dead carousels). The placeholder approach makes that class of bug
impossible, and the double-run guard makes hydration's re-creation of the
bootstrap itself a no-op.

All internal navigation uses plain `<a>` tags (full page loads), exactly
like the static site — every page boots its scripts fresh.

## Dependencies

`next`, `react`, `react-dom` (+ `nodemailer` for form email delivery).
No database, no ORM required.

## Zero external dependencies

- No external demo domains / vamtam.com / social links anywhere.
- Every link points to a local route, an in-page anchor, `tel:`, `mailto:`,
  or `#` (legal dead links).
- All assets (including the 15 lazy-loaded widget bundles) are local under
  `public/`.
- Contact details: + 91 8209530856 · +91 98765 43210 · info@morphes.cloud
