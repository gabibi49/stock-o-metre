import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CALC_KEYS, GUIDE_KEYS } from './i18n/routes';
import { EXERCISE_LEVELS, EXERCISE_THEMES } from './lib/exercise-meta';

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

/**
 * Exercices corrigés : un fichier Markdown par exercice et par langue.
 * Les deux versions d'un même exercice partagent le même `id`.
 * Dans le corps, chaque titre de niveau 3 placé après le titre de niveau 2
 * « Correction » (FR) ou « Solution » (EN) devient une étape repliée,
 * dépliée au clic (voir rehypeExerciseSteps dans astro.config.mjs).
 */
const exercises = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/exercises' }),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    lang: z.enum(['fr', 'en']),
    /** Dernier segment de l'URL, dans la langue de l'exercice. */
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string(),
    description: z.string(),
    theme: z.enum(EXERCISE_THEMES),
    level: z.enum(EXERCISE_LEVELS),
    /** Ordre d'affichage dans un même thème et un même niveau. */
    order: z.number().int().default(1),
    /** Durée indicative, en minutes. */
    minutes: z.number().int().positive(),
    /** Liens utiles (facultatifs) : calculateur, guide, outil principal. */
    calc: z.enum(CALC_KEYS).optional(),
    guide: z.enum(GUIDE_KEYS).optional(),
    tool: z.boolean().default(false),
    published: z.string(),
    updated: z.string(),
  }),
});

export const collections = { guides, pages, exercises };
