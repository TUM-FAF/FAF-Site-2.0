# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

FAF NGO landing site — a dark-theme multi-page site for FAF, a student-led NGO in Moldova. The repo contains two things:
- A legacy flat HTML/CSS lab (`index.html`, `style.css`, `reset.css` in the repo root — described in `README.md`).
- The current Astro site under `new_site/` (this is what gets deployed to Netlify).

All active development happens in `new_site/`.

## Commands (run from `new_site/`)

```bash
npm run dev       # start dev server (http://localhost:4321)
npm run build     # production build → new_site/dist/
npm run preview   # preview the production build locally
```

Netlify deploys automatically: base = `new_site`, command = `npm run build`, publish = `dist`.

## Architecture

**Framework:** Astro 6 with Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no PostCSS config).

**Layout:** All pages use `src/layouts/BaseLayout.astro`, which renders the shared `<header>`, `<footer>`, canvas backgrounds (`backgroundCanvas`, `starsCanvas`), and loads global scripts (`/stars.js`, `/mascot/mascot.js`, `/effects/planetParallax.js` from `public/`). Active nav link highlighting is done at render time using `Astro.url.pathname`.

**Pages:** Each file in `src/pages/` maps to a route: `index.astro` → `/`, `aboutUs.astro` → `/aboutUs`, `events.astro`, `gallery.astro`, `sponsorship.astro`, `volunteers.astro`.

**Styles:** Per-page CSS files live in `src/styles/` (e.g. `events.css`, `about.css`) and are imported directly inside each `.astro` page. Global styles are imported in `BaseLayout.astro`. Tailwind utility classes and the custom CSS coexist; the custom CSS uses CSS variables (e.g. `--space-xl`, `var(--accent)`) defined in `global.css`.

**Tailwind theme:** Custom colors are defined in both `tailwind.config.js` and duplicated inline in `BaseLayout.astro` via a `tailwind.config` script block (CDN fallback pattern). Brand colors: `bg: #050505`, `bg-alt: #121212`, `accent: #ff9b2b`, `accent-soft: #ff5b2b`.

**Content / CMS:** Decap CMS (`public/admin/config.yml`) manages five collections: `events`, `team`, `testimonials`, `partners`, `gallery`. Markdown files live in `src/content/{collection}/`. Schemas are defined in `src/content.config.ts` using the Astro 6 Content Layer API (`glob` loader from `astro/loaders`). Pages fetch data with `getCollection('events')` from `astro:content`. The CMS connects to GitHub repo `TUM-FAF/FAF-Site-2.0` on the `master` branch via Netlify OAuth. Uploaded media goes to `public/uploads/`.

**YAML gotchas in content files:** Frontmatter descriptions containing `: ` (colon + space) or starting with `"` must be wrapped in single quotes to avoid YAML parse errors. The Write/Edit tools may produce typographic curly quotes (`'` `'`) — always verify JS imports in `.astro` files use straight ASCII quotes (`'`).
