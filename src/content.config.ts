import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    image: image().optional(),
    venue: z.string().optional(),
    images: z.array(image()).optional(),
    draft: z.boolean().optional(),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.string(),
    photo: image().optional(),
    bio: z.string().optional(),
    sort_order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    event: z.string(),
    quote: z.string(),
    sort_order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

const partners = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/partners' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    logo: image().optional(),
    url: z.string().optional(),
    large: z.boolean().optional(),
    sort_order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    image: image(),
    caption: z.string().optional(),
    description: z.string().optional(),
    images: z.array(image()).optional(),
    sort_order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

const roles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/roles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    apply_link: z.string().optional(),
    sort_order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

const tiers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tiers' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    benefits: z.array(z.string()),
    cta_label: z.string(),
    featured: z.boolean().optional(),
    sort_order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

const home = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/home' }),
  schema: z.object({
    hero_tagline: z.string(),
    hero_title: z.string(),
    hero_subtitle: z.string(),
    hero_btn1_label: z.string().optional(),
    hero_btn1_href: z.string().optional(),
    hero_btn2_label: z.string().optional(),
    hero_btn2_href: z.string().optional(),
    hero_stats: z.array(z.object({ num: z.string(), label: z.string() })).optional(),
    next_event_label: z.string().optional(),
    next_event_title: z.string(),
    next_event_date: z.string(),
    next_event_description: z.string(),
    next_event_location: z.string(),
    next_event_btn_label: z.string().optional(),
    next_event_btn_href: z.string().optional(),
    events_heading: z.string().optional(),
    events_subtitle: z.string().optional(),
    events_list: z.array(z.string()).optional(),
    events_cta_label: z.string().optional(),
    feedback_heading: z.string().optional(),
    feedback_subtitle: z.string().optional(),
    partners_heading: z.string().optional(),
    meeting_heading: z.string(),
    meeting_subtitle: z.string(),
    meeting_roles: z.array(z.string()),
    meeting_purposes: z.array(z.string()),
  }),
});

const volunteersPage = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/volunteers-page' }),
  schema: z.object({
    hero_tagline: z.string().optional(),
    hero_heading: z.string().optional(),
    hero_subtitle: z.string().optional(),
    hero_btn1_label: z.string().optional(),
    hero_btn2_label: z.string().optional(),
    steps_heading: z.string().optional(),
    steps_subtitle: z.string().optional(),
    steps: z.array(z.object({ title: z.string(), desc: z.string() })).optional(),
    roles_heading: z.string().optional(),
    roles_subtitle: z.string().optional(),
    perks_heading: z.string().optional(),
    perks_subtitle: z.string().optional(),
    perks: z.array(z.object({ title: z.string(), desc: z.string() })).optional(),
    cta_heading: z.string().optional(),
    cta_text: z.string().optional(),
    cta_btn_label: z.string().optional(),
  }),
});

const sponsorshipPage = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/sponsorship-page' }),
  schema: z.object({
    hero_tagline: z.string().optional(),
    hero_heading: z.string().optional(),
    hero_subtitle: z.string().optional(),
    hero_btn1_label: z.string().optional(),
    hero_btn2_label: z.string().optional(),
    why_heading: z.string().optional(),
    why_subtitle: z.string().optional(),
    why_cards: z.array(z.object({ title: z.string(), desc: z.string() })).optional(),
    tiers_heading: z.string().optional(),
    tiers_subtitle: z.string().optional(),
    partners_heading: z.string().optional(),
    partners_subtitle: z.string().optional(),
  }),
});

const aboutPage = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/about-page' }),
  schema: z.object({
    intro_tagline: z.string().optional(),
    intro_heading: z.string().optional(),
    intro_text: z.string().optional(),
    details_heading: z.string().optional(),
    details_text: z.string().optional(),
    volunteer_tagline: z.string().optional(),
    volunteer_heading: z.string().optional(),
    volunteer_text: z.string().optional(),
    volunteer_btn_label: z.string().optional(),
    team_heading: z.string().optional(),
    team_subtitle: z.string().optional(),
    history_heading: z.string().optional(),
    history_text: z.string().optional(),
    history_btn_label: z.string().optional(),
  }),
});

const eventsPage = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/events-page' }),
  schema: z.object({
    promo_tagline: z.string().optional(),
    promo_heading: z.string().optional(),
    promo_text: z.string().optional(),
    promo_btn_label: z.string().optional(),
    promo_btn_href: z.string().optional(),
    title_heading: z.string().optional(),
    title_subtitle: z.string().optional(),
  }),
});

const galleryPage = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/gallery-page' }),
  schema: z.object({
    heading: z.string().optional(),
    subtitle: z.string().optional(),
  }),
});

const boardsPage = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/boards-page' }),
  schema: z.object({
    hero_tagline: z.string().optional(),
    hero_heading: z.string().optional(),
    hero_subtitle: z.string().optional(),
    stat_boards_label: z.string().optional(),
    stat_members_label: z.string().optional(),
    back_label: z.string().optional(),
  }),
});

const upcomingEvent = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/upcoming-event' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    description_extra: z.string().optional(),
    date: z.string(),
    start_time: z.string(),
    duration: z.string(),
    location: z.string(),
    address: z.string().optional(),
    format: z.string(),
    people_label: z.string(),
    banner: z.string().optional(),
    show_agenda: z.boolean(),
    show_people: z.boolean(),
    show_sponsors: z.boolean(),
    registration_open: z.boolean().default(true),
    registration_subtitle: z.string().optional(),
    about_label: z.string().optional(),
    about_heading: z.string().optional(),
    agenda_label: z.string().optional(),
    agenda_heading: z.string().optional(),
    agenda_coming_soon: z.string().optional(),
    people_heading: z.string().optional(),
    people_coming_soon: z.string().optional(),
    sponsors_label: z.string().optional(),
    sponsors_heading: z.string().optional(),
    sponsors_intro: z.string().optional(),
    sponsors_coming_soon: z.string().optional(),
    register_label: z.string().optional(),
    register_heading: z.string().optional(),
    registration_closed_text: z.string().optional(),
    registration_fields: z.array(z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'email', 'tel', 'select', 'textarea']),
      required: z.boolean().optional(),
      placeholder: z.string().optional(),
      full_width: z.boolean().optional(),
      options: z.array(z.string()).optional(),
    })).optional(),
    agenda: z.array(z.object({
      time: z.string(),
      title: z.string(),
      desc: z.string(),
    })).optional(),
    people: z.array(z.object({
      name: z.string(),
      role: z.string(),
      company: z.string().optional(),
      photo: z.string().optional(),
    })).optional(),
    sponsors: z.array(z.object({
      name: z.string(),
      logo: z.string().optional(),
      large: z.boolean().optional(),
    })).optional(),
  }),
});

const boards = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/boards' }),
  schema: ({ image }) => z.object({
    number: z.number(),
    description: z.string(),
    members: z.array(z.object({
      name: z.string(),
      role: z.string().optional(),
      photo: image().optional(),
    })).optional(),
  }),
});

export const collections = { events, team, testimonials, partners, gallery, roles, tiers, home, upcomingEvent, boards, volunteersPage, sponsorshipPage, aboutPage, eventsPage, galleryPage, boardsPage };
