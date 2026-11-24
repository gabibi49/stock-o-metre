/**
 * Pages des exercices corrigés, générées depuis la collection « exercises ».
 * Chaque exercice doit exister dans les deux langues (même `id`) : sinon le
 * build échoue, pour ne jamais publier de lien hreflang cassé.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { LANGS, ROUTES, BASE, type Lang } from '../i18n/routes';
import { EXERCISE_LEVELS, EXERCISE_THEMES } from './exercise-meta';

export type ExerciseEntry = CollectionEntry<'exercises'>;

export interface ExercisePage {
  id: string;
  lang: Lang;
  entry: ExerciseEntry;
  /** Chemin sans le chemin de base, ex. « /fr/exercices/stock-de-securite-debutant/ ». */
  route: string;
  /** Chemin de la même page dans chaque langue (avec le chemin de base). */
  paths: Record<Lang, string>;
}

export function exerciseRoute(lang: Lang, slug: string): string {
  return `${ROUTES.exercises[lang]}${slug}/`;
}

const sortKey = (e: ExerciseEntry) =>
  [
    EXERCISE_THEMES.indexOf(e.data.theme),
    EXERCISE_LEVELS.indexOf(e.data.level),
    e.data.order,
  ] as const;

/** Toutes les pages d'exercices, triées par thème, niveau puis ordre. */
export async function exercisePages(): Promise<ExercisePage[]> {
  const all = await getCollection('exercises');
  const byId = new Map<string, Partial<Record<Lang, ExerciseEntry>>>();
  for (const e of all) {
    const pair = byId.get(e.data.id) ?? {};
    if (pair[e.data.lang]) throw new Error(`Exercice en double : ${e.data.id} (${e.data.lang})`);
    pair[e.data.lang] = e;
    byId.set(e.data.id, pair);
  }
  const pages: ExercisePage[] = [];
  for (const [id, pair] of byId) {
    for (const lang of LANGS) {
      if (!pair[lang]) throw new Error(`Exercice ${id} : version « ${lang} » manquante`);
    }
    const fr = pair.fr as ExerciseEntry;
    const en = pair.en as ExerciseEntry;
    if (fr.data.theme !== en.data.theme || fr.data.level !== en.data.level) {
      throw new Error(`Exercice ${id} : thème ou niveau différent entre FR et EN`);
    }
    const paths = {
      fr: `${BASE}${exerciseRoute('fr', fr.data.slug)}`,
      en: `${BASE}${exerciseRoute('en', en.data.slug)}`,
    };
    for (const lang of LANGS) {
      const entry = pair[lang] as ExerciseEntry;
      pages.push({ id, lang, entry, route: exerciseRoute(lang, entry.data.slug), paths });
    }
  }
  return pages.sort((a, b) => {
    const ka = sortKey(a.entry);
    const kb = sortKey(b.entry);
    return ka[0] - kb[0] || ka[1] - kb[1] || ka[2] - kb[2] || a.id.localeCompare(b.id);
  });
}
