export type AbcClass = 'A' | 'B' | 'C';
export type XyzClass = 'X' | 'Y' | 'Z';

export interface AbcThresholds {
  /** Part cumulée de la classe A (ex. 0,80). */
  a: number;
  /** Part de la classe B (ex. 0,15). La classe C reçoit le reste. */
  b: number;
}

export interface XyzThresholds {
  /** CV strictement inférieur → X (ex. 0,5). */
  x: number;
  /** CV inférieur ou égal → Y (ex. 1). Au-delà → Z. */
  y: number;
}

export const DEFAULT_ABC: AbcThresholds = { a: 0.8, b: 0.15 };
export const DEFAULT_XYZ: XyzThresholds = { x: 0.5, y: 1 };

export interface AbcEntry {
  index: number;
  value: number;
  share: number;
  cumulativeShare: number;
  abc: AbcClass;
}

/**
 * Classement ABC (Pareto).
 *
 * Les articles sont triés par valeur décroissante (égalités : ordre d'origine).
 * Un article est classé selon la part cumulée **avant** lui : A si elle est
 * inférieure au seuil A, B si elle est inférieure à A + B, sinon C. Ainsi
 * l'article qui fait franchir le seuil reste dans la classe supérieure, et le
 * premier article est toujours A. Un article de valeur nulle est toujours C.
 *
 * Renvoie les entrées dans l'ordre de tri (utile pour la courbe de Pareto) ;
 * `index` renvoie à la position d'origine.
 */
export function classifyAbc(values: readonly number[], t: AbcThresholds = DEFAULT_ABC): AbcEntry[] {
  if (!(t.a > 0 && t.b >= 0 && t.a + t.b <= 1 + 1e-12)) {
    throw new RangeError('Seuils ABC invalides');
  }
  const total = values.reduce((s, v) => s + Math.max(0, v), 0);
  const order = values
    .map((v, i) => ({ v: Math.max(0, v), i }))
    .sort((p, q) => q.v - p.v || p.i - q.i);
  let cum = 0;
  return order.map(({ v, i }) => {
    const before = total > 0 ? cum / total : 1;
    cum += v;
    const share = total > 0 ? v / total : 0;
    let abc: AbcClass;
    if (v <= 0) abc = 'C';
    else if (before < t.a - 1e-12) abc = 'A';
    else if (before < t.a + t.b - 1e-12) abc = 'B';
    else abc = 'C';
    return { index: i, value: v, share, cumulativeShare: total > 0 ? cum / total : 0, abc };
  });
}

/** Classe XYZ à partir du coefficient de variation (null si μ = 0). */
export function classifyXyz(cv: number | null, t: XyzThresholds = DEFAULT_XYZ): XyzClass | null {
  if (cv === null || !Number.isFinite(cv)) return null;
  if (cv < t.x) return 'X';
  if (cv <= t.y) return 'Y';
  return 'Z';
}
