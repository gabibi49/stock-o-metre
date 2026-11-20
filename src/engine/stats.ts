export function sum(values: readonly number[]): number {
  let s = 0;
  for (const v of values) s += v;
  return s;
}

export function mean(values: readonly number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

/**
 * Écart-type d'échantillon (dénominateur n − 1). Renvoie 0 si n < 2 : la
 * dispersion est alors inconnue, ce qui est signalé par l'alerte « historique court ».
 */
export function sampleStdDev(values: readonly number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const m = mean(values);
  let ss = 0;
  for (const v of values) ss += (v - m) ** 2;
  return Math.sqrt(ss / (n - 1));
}

/** Coefficient de variation σ / μ, ou null si μ ≤ 0 (non défini). */
export function coefficientOfVariation(mu: number, sigma: number): number | null {
  return mu > 0 ? sigma / mu : null;
}

/** Part des périodes à consommation nulle (0 à 1). */
export function zeroShare(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let z = 0;
  for (const v of values) if (v === 0) z++;
  return z / values.length;
}
