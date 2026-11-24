export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/**
 * Table de correspondance des pages : une clé par page, son chemin dans chaque
 * langue. Le sélecteur de langue, les balises hreflang et le sitemap s'en servent.
 */
export const ROUTES = {
  home: { fr: '/fr/', en: '/en/' },
  guides: { fr: '/fr/guides/', en: '/en/guides/' },
  guideSafety: {
    fr: '/fr/guides/calcul-stock-de-securite/',
    en: '/en/guides/safety-stock-formula/',
  },
  guideTarget: {
    fr: '/fr/guides/stock-cible-niveau-de-recompletement/',
    en: '/en/guides/order-up-to-level/',
  },
  guideRop: { fr: '/fr/guides/point-de-commande/', en: '/en/guides/reorder-point/' },
  guideAbcXyz: { fr: '/fr/guides/classement-abc-xyz/', en: '/en/guides/abc-xyz-analysis/' },
  guideService: {
    fr: '/fr/guides/taux-de-service-par-classe/',
    en: '/en/guides/service-level-by-class/',
  },
  guideExport: {
    fr: '/fr/guides/exporter-mouvements-de-stock-csv/',
    en: '/en/guides/export-stock-movements-csv/',
  },
  calculators: { fr: '/fr/calculateurs/', en: '/en/calculators/' },
  calcSafety: {
    fr: '/fr/calculateurs/stock-de-securite/',
    en: '/en/calculators/safety-stock/',
  },
  calcRop: { fr: '/fr/calculateurs/point-de-commande/', en: '/en/calculators/reorder-point/' },
  calcTarget: { fr: '/fr/calculateurs/stock-cible/', en: '/en/calculators/target-stock/' },
  calcCoverage: {
    fr: '/fr/calculateurs/couverture-de-stock/',
    en: '/en/calculators/days-of-cover/',
  },
  exercises: { fr: '/fr/exercices/', en: '/en/exercises/' },
  kit: { fr: '/fr/kit-ordonnancement/', en: '/en/production-scheduling-kit/' },
  simulation: { fr: '/fr/simulation/', en: '/en/simulation/' },
  methodology: { fr: '/fr/methodologie/', en: '/en/methodology/' },
  privacy: { fr: '/fr/confidentialite/', en: '/en/privacy/' },
  legal: { fr: '/fr/mentions-legales/', en: '/en/legal-notice/' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof ROUTES;
export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

export const GUIDE_KEYS = [
  'guideSafety',
  'guideTarget',
  'guideRop',
  'guideAbcXyz',
  'guideService',
  'guideExport',
] as const satisfies readonly RouteKey[];
export type GuideKey = (typeof GUIDE_KEYS)[number];

export const CALC_KEYS = [
  'calcSafety',
  'calcRop',
  'calcTarget',
  'calcCoverage',
] as const satisfies readonly RouteKey[];
export type CalcKey = (typeof CALC_KEYS)[number];

/** Guide lié à chaque mini-calculateur (maillage interne). */
export const CALC_GUIDE: Record<CalcKey, GuideKey> = {
  calcSafety: 'guideSafety',
  calcRop: 'guideRop',
  calcTarget: 'guideTarget',
  calcCoverage: 'guideTarget',
};

/** Mini-calculateur lié à chaque guide. */
export const GUIDE_CALC: Record<GuideKey, CalcKey> = {
  guideSafety: 'calcSafety',
  guideTarget: 'calcTarget',
  guideRop: 'calcRop',
  guideAbcXyz: 'calcSafety',
  guideService: 'calcSafety',
  guideExport: 'calcCoverage',
};

/** Chemin de base du site (« /stock-o-metre »), sans barre finale. */
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Chemin complet d'une page, avec le chemin de base. */
export function pathTo(key: RouteKey, lang: Lang): string {
  return `${BASE}${ROUTES[key][lang]}`;
}

/** Chemin complet d'un fichier du dossier public. */
export function asset(path: string): string {
  return `${BASE}/${path.replace(/^\//, '')}`;
}

/** URL absolue (pour canonical, hreflang, Open Graph, sitemap). */
export function absoluteUrl(path: string): string {
  return new URL(path, import.meta.env.SITE).href;
}

export function otherLang(lang: Lang): Lang {
  return lang === 'fr' ? 'en' : 'fr';
}
