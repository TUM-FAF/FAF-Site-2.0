# FAF Landing Page – Site 2.0

This project is a responsive, modern landing site for **FAF** (Fiesta Auto-Help and Friends), a student-led NGO that connects Moldova's IT community through hackathons, lectures, workshops, and tech events.

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
├── new_site/                    # Astro project root
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # Reusable Astro/React components
│   │   ├── layouts/            # Page layouts
│   │   ├── content/            # Content collections (events, team, testimonials, etc.)
│   │   └── styles/             # Global CSS
│   ├── public/                 # Static assets (images, logos)
│   ├── astro.config.mjs        # Astro configuration
│   ├── package.json
│   └── package-lock.json
├── admin/                       # Decap CMS admin config
│   └── config.yml              # CMS configuration
├── .gitignore
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

2. **Navigate to the Astro project**
   ```bash
   cd new_site
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:4321/` (or the port displayed in your terminal).

5. **Build for production**
   ```bash
   npm run build
   ```

   Static files are generated in the `dist/` directory.

6. **Preview production build locally**
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

### Live Site

**URL**: [https://faf-site-2-0.pages.dev](https://faf-site-2-0.pages.dev)

(Update this with your actual deployment URL)

### CMS Admin Dashboard

**URL**: [https://faf-site-2-0.pages.dev/admin/](https://faf-site-2-0.pages.dev/admin/)

(Update this with your actual admin URL)

## Available Scripts

From the `new_site/` directory:

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