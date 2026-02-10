# FAF Landing Page – Lab

This lab implements a responsive single‑page **landing** site for FAF, a student‑led NGO that connects Moldova’s IT community through hackathons, lectures, and tech events.

## 1. Project structure

- `index.html` – main landing page markup.
- `style.css` – main styling (layout, grids, typography, colors).
- `reset.css` – CSS reset for consistent base across browsers.
- `logo-faf-dark.jpg` – FAF logo used in the header and hero.

## 2. Landing page overview

The landing page is a dark‑theme one‑pager with accent gradients and glassmorphism cards, optimized for desktop and mobile. It is structured into the following sections:

1. **Hero**
    - Presents FAF as a student‑led NGO in Moldova that connects students, mentors, and tech companies through tech events.
    - Contains a large headline (“Grow our community”), a short tagline, descriptive text, and call‑to‑action buttons for joining or contacting FAF.
    - On the right, a photo collage and a glassmorphism info card highlight key aspects of the community and upcoming initiatives.

2. **About / Goals**
    - Explains that FAF organizes hackathons, open lectures, and workshops to build real skills and bridge university and industry.
    - Uses goal cards laid out in a responsive grid (`.goals`) to describe community growth, hands‑on learning, and collaboration.

3. **Events**
    - Lists key recurring events: Summer Hackathon, XMAS FAF Hack, lectures, SheNovate, community evenings, and more.
    - Each event card includes a title, short description, tags, and can include expandable photo galleries under “event details.”

4. **Partners**
    - Displays partner logos in a responsive logo grid (`.partners-logos-row`) with consistent sizing and hover effects.
    - Uses a subtle radial gradient background to visually separate this section.]

5. **Feedback / Testimonials**
    - Shows participant quotes from XMAS FAF Hackathon 2024–2025 and SheNovate 2025, highlighting event experience and organization quality.
- 
  - Cards are laid out in a grid (`.feedback-grid`) with readable typography.

6. **Team**
    - Introduces the core coordination team roles (CEO, COO, CFO, CCO, CMO, CPO) responsible for FAF projects.
    - Uses circular avatars and role descriptions in a flexible row (`.team-row`, `.team-card`).

7. **Contact & Footer**
    - Contact band includes address (`str. Studenților 7, birou 309, Chișinău, Moldova`), email (`faf@fcim.utm.md`), and social links.
    - Mentions the Telegram channel used for important announcements and event updates.
    - Footer contains basic copyright / meta info styled with a top border.

## 3. Running locally

1. Clone or download the lab repository.
2. Ensure the files `index.html`, `style.css`, and `reset.css` are in the project root.
3. Open `index.html` directly in a browser (double‑click or “Open with Browser”).

No build step or backend is required; it is a static HTML/CSS project.

## 4. Deployment location
The landing page is deployed at: [https://diana7376.github.io/tum-web-lab2/](https://diana7376.github.io/tum-web-lab2/)

## 5. Responsive behavior

- Uses CSS Grid and Flexbox for layout in the hero, goals, events, partners, feedback, and team sections.
- Media queries at 900px, 768px, and 600px adjust paddings, hide the desktop navigation, collapse grids to fewer columns, and center hero content on small screens.
- The design preserves readability and spacing across desktop, tablet, and mobile.
