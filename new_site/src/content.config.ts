import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    image: z.string().optional(),
    venue: z.string().optional(),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string().optional(),
    bio: z.string().optional(),
    sort_order: z.number().optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    event: z.string(),
    quote: z.string(),
    sort_order: z.number().optional(),
  }),
});

const partners = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/partners' }),
  schema: z.object({
    name: z.string(),
    logo: z.string(),
    url: z.string().optional(),
    large: z.boolean().optional(),
    sort_order: z.number().optional(),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    caption: z.string().optional(),
    sort_order: z.number().optional(),
  }),
});

const roles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/roles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    apply_link: z.string().optional(),
    sort_order: z.number().optional(),
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
  }),
});

export const collections = { events, team, testimonials, partners, gallery, roles, tiers, home };
