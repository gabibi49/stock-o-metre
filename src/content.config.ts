import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { GUIDE_KEYS } from './i18n/routes';

/** Guides SEO : un fichier Markdown par guide et par langue (rédaction native, pas de traduction mot à mot). */
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    key: z.enum(GUIDE_KEYS),
    lang: z.enum(['fr', 'en']),
    /** Points du résumé affiché en haut de l'article. */
    summary: z.array(z.string()).min(2),
    published: z.string(),
    updated: z.string(),
  }),
});

/** Pages de contenu long : méthodologie, confidentialité, mentions légales. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    key: z.enum(['methodology', 'privacy', 'legal']),
    lang: z.enum(['fr', 'en']),
    updated: z.string(),
  }),
});

export const collections = { guides, pages };
