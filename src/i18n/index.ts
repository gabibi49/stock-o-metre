import fr, { type Dict } from './fr';
import en from './en';
import type { Lang } from './routes';

export type { Dict };
export const DICTS: Record<Lang, Dict> = { fr, en };

export function dict(lang: Lang): Dict {
  return DICTS[lang];
}

/** Remplace les variables {nom} d'un modèle de texte. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export type Plural = { one: string; other: string };

/** Choisit la forme au singulier ou au pluriel selon la langue, puis remplace les variables. */
export function plural(
  lang: Lang,
  forms: Plural,
  count: number,
  vars: Record<string, string | number> = {},
): string {
  const rule = new Intl.PluralRules(lang === 'fr' ? 'fr-FR' : 'en-GB').select(count);
  return fmt(rule === 'one' ? forms.one : forms.other, { count, ...vars });
}

export const LOCALES: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB' };
