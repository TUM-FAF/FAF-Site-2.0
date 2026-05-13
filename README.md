# FAF Landing Page – Site 2.0

This project is a responsive, modern landing site for **FAF**, a student-led NGO that connects Moldova's IT community through hackathons, lectures, workshops, and tech events.

## Technology Stack

### Static Site Generator (SSG)

**Astro** is used as the primary static site generator.

**Why Astro?**
- **Zero JavaScript by default**: Delivers ultra-fast static HTML with no unnecessary JavaScript overhead
- **Island Architecture**: Load interactive components only where needed, minimizing bundle size
- **Framework Agnostic**: Mix and match multiple frameworks (React, Vue, Svelte) in a single project if needed
- **Content Collections**: Built-in support for organizing and validating content (perfect for scaling from static files to CMS)
- **Fast build times**: Optimized for rapid development and deployment cycles
- **Perfect for marketing sites**: Astro is purpose-built for content-heavy, performance-critical websites like landing pages
- **SEO-friendly**: Full static rendering ensures excellent search engine indexing

### Content Management System (CMS)

**Decap CMS** (formerly Netlify CMS) is integrated for content management.

**Why Decap CMS?**
- **Git-backed**: Content lives in the repository as Markdown/YAML files—no external database or vendor lock-in
- **Lightweight & Open-source**: Minimal overhead and full transparency
- **Developer-friendly**: Easy to customize, extend, and version control alongside code
- **Perfect for static sites**: Designed specifically for Astro and static site generators
- **No hosting fees**: CMS admin dashboard is served from the same static build
- **Easy onboarding**: Non-technical editors can manage content through an intuitive UI without touching Git
- **Markdown + Frontmatter**: Native support for structured content that pairs seamlessly with Astro's content collections

## Project Structure

```
FAF-Site-2.0/
├── src/
│   ├── pages/              # Route pages
│   ├── layouts/            # Page layouts
│   ├── content/            # Content collections (events, team, gallery, etc.)
│   └── styles/             # Global CSS
├── public/                 # Static assets (images, logos)
│   └── admin/              # Decap CMS admin config
├── games/                  # Interactive easter-egg HTML5 games
├── astro.config.mjs        # Astro configuration
├── netlify.toml            # Netlify configuration
├── package.json
└── README.md
```

## Local Development

### Prerequisites

- **Node.js** version 18.17.1 or higher
- **npm** or **yarn** package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/TUM-FAF/FAF-Site-2.0.git
   cd FAF-Site-2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:4321/` (or the port displayed in your terminal).

4. **Build for production**
   ```bash
   npm run build
   ```

   Static files are generated in the `dist/` directory.

5. **Preview production build locally**
   ```bash
   npm run preview
   ```

## Content Management

### Accessing the CMS Admin Panel

Once the site is deployed, the Decap CMS admin panel is available at:

```
https://fafngo.netlify.app/admin/
```

This allows non-technical team members to:
- Create, edit, and publish events
- Manage team member profiles
- Update testimonials and feedback
- Modify other content without touching code

**Note**: For local development with CMS features, you'll need to configure authentication (GitHub OAuth is recommended via Netlify).

## Deployment

### GitHub Pages (primary)

A GitHub Actions workflow at `.github/workflows/deploy.yml` builds and publishes the site on every push to `master`.

One-time setup:

1. **Settings → Pages → Source** → set to **GitHub Actions**.
2. Add the build-time variables (see the [Environment variables](#environment-variables) table) under **Settings → Secrets and variables → Actions**.

The site is built with `base: '/FAF-Site-2.0'` so it serves correctly under the repo path. A `public/.nojekyll` file prevents GitHub Pages from stripping `_astro/` chunks.

**Live URL**: [https://tum-faf.github.io/FAF-Site-2.0/](https://tum-faf.github.io/FAF-Site-2.0/)

### Netlify (fallback)

`netlify.toml` is still wired so Netlify can build the same repo if needed:

```bash
npm install netlify-cli -g
ntl login
ntl init
ntl deploy --prod
```

Live: [https://fafngo.netlify.app](https://fafngo.netlify.app). The Astro `base` setting still applies on Netlify, so the deployed Netlify URL serves from `/FAF-Site-2.0/` as well — adjust `astro.config.mjs` to drop `base` if you want the Netlify site at root.

### CMS Admin Dashboard

On GitHub Pages: [https://tum-faf.github.io/FAF-Site-2.0/admin/](https://tum-faf.github.io/FAF-Site-2.0/admin/)
On Netlify: [https://fafngo.netlify.app/admin/](https://fafngo.netlify.app/admin/)

## Environment variables

Configure in **Settings → Secrets and variables → Actions** of the GitHub repo, then commit/push to `master` to trigger a rebuild.

| Name | Kind | Purpose |
|------|------|---------|
| `PUBLIC_FORM_ENDPOINT` | Secret | POST endpoint for the meeting form (Google Apps Script Web App URL) |
| `PUBLIC_EVENT_FORM_ENDPOINT` | Secret | POST endpoint for the event registration form |
| `PUBLIC_MATOMO_URL` | Variable | Matomo instance URL, e.g. `https://matomo.example.com/` |
| `PUBLIC_MATOMO_SITE_ID` | Variable | Numeric site ID from the Matomo dashboard |
| `PUBLIC_MATOMO_COOKIE_DOMAIN` | Variable (optional) | Share Matomo cookies across subdomains, e.g. `*.fafngo.netlify.app`. Leave unset for single-host deployments like GitHub Pages. |

> ⚠️ All four are `PUBLIC_` Astro vars — they are inlined into the client bundle at build time and **are not secret post-build**. The Secret/Variable distinction only controls whether the value is masked in CI logs and where you store it. Choose Secrets for endpoint URLs you don't want pasted into PRs and Variables for values that are okay being visible.

A `.env.example` documents the same names for local development. Copy it to `.env` and fill in your own values to test locally.

## Forms

**Status:** Submission is wired in code and ready to receive a real endpoint URL. The current build has empty endpoint values, so the forms intentionally show "not configured." We have **not** verified an end-to-end live submission because no production Apps Script URL has been provided. Once `PUBLIC_FORM_ENDPOINT` / `PUBLIC_EVENT_FORM_ENDPOINT` are set in repo Secrets and the site is rebuilt, the meeting and event forms will POST to those endpoints as documented below.

The site has two forms that POST as JSON to externally hosted endpoints (the recommended pattern is a Google Apps Script Web App):

- **Meeting form** — `src/pages/index.astro` (id `meeting-form`), reads `PUBLIC_FORM_ENDPOINT`.
- **Event registration form** — `src/pages/upcoming-event.astro` (id `ue-form`), reads `PUBLIC_EVENT_FORM_ENDPOINT`. Fields come from `src/content/upcoming-event/index.md → registration_fields`.

Both forms include a `_honey` honeypot field for bot mitigation.

**GitHub Pages cannot process forms by itself** — it is static hosting. Submissions go to the configured external endpoint.

If the endpoint env var is empty at build time, the form will render and on submit show:

> Form endpoint not configured. *(meeting)*
> Registration endpoint not configured. *(event)*

### Why `mode: 'no-cors'`

`mode: 'no-cors'` is used because Google Apps Script does not return CORS headers. The trade-off is that the response is **opaque** to the browser:

- `.then()` runs whenever the request reaches the server and the server returns any response — even an HTTP 500. The client cannot read the status.
- `.catch()` runs only for hard network failures (DNS, offline, request never sent).

In practice this means the UI shows a success message as long as the request was delivered. **Confirm receipt server-side** (Apps Script execution log, target spreadsheet, or destination inbox).

The form `fetch` calls also intentionally omit a `Content-Type` header: under `no-cors` only CORS-safelisted Content-Types are allowed (`application/json` is not one of them), and Apps Script reads the raw body via `e.postData.contents` regardless of the header.

If you swap Apps Script for a CORS-enabled service (Formspree, Basin, Getform), drop `mode: 'no-cors'` from the two `<script>` blocks in `src/pages/index.astro` and `src/pages/upcoming-event.astro` to get real success/failure handling client-side.

## Matomo analytics

Visit tracking via the Matomo JavaScript snippet. Implemented in `src/components/MatomoAnalytics.astro` and mounted globally inside `src/layouts/BaseLayout.astro`.

- If both `PUBLIC_MATOMO_URL` **and** `PUBLIC_MATOMO_SITE_ID` are set at build time, the tracker is injected into every page's `<head>`.
- If either is missing, the component renders nothing — no console warnings, builds succeed.
- No Matomo API token is needed. This is only the front-end tracking pixel; statistics are viewed in your Matomo instance's own dashboard.
- Optional `PUBLIC_MATOMO_COOKIE_DOMAIN` lets you share visitor cookies across subdomains (useful for Netlify deploy previews like `deploy-preview-xx--fafngo.netlify.app` — set it to `*.fafngo.netlify.app`). Leave it unset on GitHub Pages.

## API documentation

**Swagger/OpenAPI is not applicable.** This site is fully static and owns no backend API routes. Form submissions are POSTed to an externally configured Google Apps Script Web App, addressed via the env vars above. There is no project-owned API surface to document.

## Available Scripts

From the repository root:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local development server (auto-reload on changes) |
| `npm run build` | Build static site for production |
| `npm run preview` | Preview production build locally |
| `npm run astro` | Run Astro CLI commands |

## Key Features

1. **Hero Section**
   - Eye-catching headline and value proposition
   - Call-to-action buttons for joining/contacting FAF
   - Photo collage and glassmorphism info card

2. **About / Goals**
   - Community mission and values
   - Responsive grid layout with goal cards

3. **Events**
   - Featured events (Summer Hackathon, XMAS FAF Hack, SheNovate, etc.)
   - Event cards with descriptions and expandable galleries
   - Managed via Decap CMS

4. **Partners**
   - Partner logos in responsive grid
   - Smooth hover effects

5. **Testimonials**
   - Participant feedback and quotes
   - Social proof from past events

6. **Team**
   - Core team members with roles and avatars
   - Easily updated through CMS

7. **Contact & Footer**
   - Contact information and social links
   - Telegram channel for announcements

8. **Easter Egg Games**
   - Integrated HTML5 games ("Space Invaders" and an Undertale-style boss battle) allowing users to interact beyond typical static pages. 
   - Games are located in the `games/` folder and pre-built files exist under `public/games/`. You can edit them using Vite inside their respective directories.

## Responsive Design

- **Mobile-first approach** using CSS Grid and Flexbox
- **Breakpoints** at 900px, 768px, and 600px for optimal viewing on all devices
- **Performance optimized** with minimal CSS and no render-blocking scripts

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

## License

****

## Contact & Support

For questions or support regarding the FAF website:

- **Email**: faf@fcim.utm.md
- **Address**: str. Studenților 7, birou 309, Chișinău, Moldova
- **Telegram**: [FAF Community Channel](https://t.me/your-channel-link)

---

**Built with ❤️ by the FAF Community**