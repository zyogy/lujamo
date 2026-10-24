import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * Content lives in one folder per language: src/content/<collection>/<lang>/<id>.yaml
 * Entry ids therefore look like "fi/digital". See src/lib/content.ts for the
 * helpers that pick the right language and fall back to Finnish.
 */

// Id = file path without extension ("fi/digital"). Explicit, because the default
// would use a `slug` field from the data instead.
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.(ya?ml|md)$/, '');

const item = z.object({ title: z.string(), text: z.string() });

/** Page building blocks for division and product pages. */
const block = z.discriminatedUnion('type', [
  // Paragraphs separated by blank lines
  z.object({ type: z.literal('text'), heading: z.string(), body: z.string() }),
  // Plain list of things (services, features)
  z.object({ type: z.literal('list'), heading: z.string(), intro: z.string().optional(), items: z.array(item) }),
  // A real sequence – rendered with step numbers
  z.object({ type: z.literal('steps'), heading: z.string(), intro: z.string().optional(), items: z.array(item) }),
  // Lists Lujamo's own projects as short references
  z.object({ type: z.literal('projects'), heading: z.string(), intro: z.string().optional() }),
  // Closing call to action linking to the contact form with a topic preselected
  z.object({ type: z.literal('cta'), heading: z.string(), text: z.string(), topic: z.string().optional() }),
]);

/**
 * Units = services (what Lujamo sells, e.g. app development) and projects
 * (Lujamo's own products and ventures, e.g. ValmiusTurva, Luja Fight).
 * Adding one: a file per language here (+ an accent token in tokens.css for a
 * project). Services appear in the main nav; projects on the Projects page,
 * as references on the front page, in the footer and as contact topics.
 */
const units = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/units', generateId }),
  schema: z.object({
    kind: z.enum(['service', 'project']),
    order: z.number(),
    accent: z.string(), // token name in tokens.css: --<accent>
    slug: z.string(), // URL path without language prefix, e.g. "digital/turva"
    name: z.string(),
    navLabel: z.string().optional(), // label in the header nav (services)
    label: z.string(), // one or two words describing it, e.g. "Varautumissovellus"
    title: z.string(), // <title>
    description: z.string(), // meta description
    summary: z.string(), // front page text
    highlights: z.array(z.string()).optional(), // front page short list (services)
    facts: z.array(z.string()).optional(), // key facts (projects)
    logo: z.string().optional(),
    screenshot: z.object({ src: z.string(), alt: z.string(), caption: z.string(), width: z.number(), height: z.number() }).optional(),
    // 'app' is a generic illustration; 'valmiusturva' shows the actual app.
    visual: z.enum(['app', 'valmiusturva']).optional(),
    intro: z.object({ heading: z.string(), lead: z.string(), body: z.string().optional() }),
    blocks: z.array(block).default([]),
  }),
});

/** Fixed pages (home, about, projects, contact, thanks, privacy). Fields vary per page. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,md}', base: './src/content/pages', generateId }),
  schema: z.object({ title: z.string(), description: z.string() }).catchall(z.any()),
});

export const collections = { units, pages };
