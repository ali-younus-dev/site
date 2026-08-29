# Fotile Pakistan — New Website

The rebuilt **fotilepk.com** — a fast, static, mobile-first site replacing the old WordPress build,
with the existing URL structure preserved so search rankings carry over.

> **This is a preview for review and approval. Nothing here is live yet.**
> The current public site is unchanged.

---

## 👀 Review it here

**Live preview:** _(add your GitHub Pages link here once it's switched on)_

Open it on a phone as well as a laptop — the whole site is built mobile-first.

---

## What to look at

| Page | What's new |
|---|---|
| **Home** | Cinematic video hero, scroll-lit statement text, auto-cycling product showcase |
| **The F20 Refrigerator** (`/fridge/`) | Launch page — press the fridge doors to open them, then tap the glowing points |
| **Products** (`/shop/`) | 58 products, video banner, live sale badges, full spec tables on every product |
| **360° product views** | On products photographed from several angles, drag the picture to turn it — try [Range Hood 9050](shop/range-hood-9050/) and [Gas Hob GAL90506](shop/gas-hob-gal90506/). Products that come in more than one finish get colour switches — try [Oven KSG7003AT-Y](shop/electric-built-in-oven-ksg7003at-y/) and [Microwave 25800K-C2G](shop/microwave-oven-25800k-c2g/). Tap the picture for a full-screen look. |
| **Moon Series** (`/moon-series/`) | Planet-zoom cinematic banner for the premium collection |
| **Fotile Pulse** (`/newsletter/`) | Company updates, events, and a custom-built video player |
| **Service Centre** (`/service-center/`) | Helpline **042-111-131-517**, live open/closed status, booking wizard, coverage radar |
| **Contact** (`/contact-us/`) | One form covering quotes, service, and complaints |
| **Staff Control Panel** (`/dashboard-demo.html`) | Preview of the admin dashboard — edit product names, prices, sale % and photos with no developer |

> **About the control panel preview:** this preview link is static hosting, which cannot run
> server code, so the demo keeps your edits **in your own browser only** — the website is not
> changed. On the live site the same screen saves instantly to the server (press Save & Publish
> and every page updates at once). Everything else about the screen is identical.

---

## What's already done

- **58 product pages** with real specifications, images and structured data
- **63 blog posts** migrated at their original URLs
- **SEO preserved** — same URL structure, canonical tags, sitemap, 301 redirects for old URLs,
  and structured data (Organization, Product, FAQ, Breadcrumb) on every page
- **Analytics** — Google Analytics 4 + Meta Pixel wired site-wide
- **Fully responsive** — verified on phone, tablet and desktop
- **Self-hosted fonts** — no external dependencies, so it loads fast everywhere (including China)

## Still to finish

- Real prices (everything currently says "Request a Quote")
- 6 remaining blog posts (63 of 69 migrated)
- Final approval, then the switch-over to the live domain

---

## Notes for whoever deploys this

It is a **plain static site** — HTML, CSS and JavaScript. No build step, no framework, no
`npm install`. Upload the folder to the web host and it runs.

Two files are **not** in this repository on purpose (see `.gitignore`): `dashboard.php` and
`admin-api.php` — the staff control panel that lets non-developers edit products, prices, sale
percentages and photos without touching code. They hold the admin password hash, so they are
uploaded directly to the host instead. They need PHP, which the host already runs.

Internal links are written root-absolute (`/shop/`) for the live domain. `mobile-nav.js`
automatically rewrites them when the site is served from a subfolder (like a GitHub Pages preview)
or opened straight from disk — so the preview behaves exactly like the finished site.

---

© Fotile Pakistan
