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
    next_event_title: z.string(),
    next_event_date: z.string(),
    next_event_description: z.string(),
    next_event_location: z.string(),
    meeting_heading: z.string(),
    meeting_subtitle: z.string(),
    meeting_roles: z.array(z.string()),
    meeting_purposes: z.array(z.string()),
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

export const collections = { events, team, testimonials, partners, gallery, roles, tiers, home, upcomingEvent, boards };
