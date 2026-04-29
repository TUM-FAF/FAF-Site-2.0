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

### Netlify (Recommended)

The easiest way to deploy this project is via Netlify, using the provided `netlify.toml` file. 

If using the Netlify CLI (Secret Code / Login approach):
```bash
npm install netlify-cli -g
ntl login
ntl init
ntl deploy --prod
```
Alternatively, just link the GitHub repository in the Netlify Dashboard.

### GitHub Pages

A GitHub Actions workflow is included at `.github/workflows/deploy.yml`. 
To use this, go to your repository **Settings > Pages** and set **Source** to **GitHub Actions**. Pushing to `main` will trigger a build and publish the site.

### Live Site

**URL**: [https://fafngo.netlify.app](https://fafngo.netlify.app)
*(Netlify)*

**GitHub Pages URL**: [https://tum-faf.github.io/FAF-Site-2.0/](https://tum-faf.github.io/FAF-Site-2.0/) 

### CMS Admin Dashboard

**URL**: [https://fafngo.netlify.app/admin/](https://fafngo.netlify.app/admin/)

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