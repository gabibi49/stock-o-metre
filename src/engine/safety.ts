import { normInv } from './normal';
import { DAYS_PER_PERIOD, type PeriodKind } from './periods';

/**
 * - `demand` : demande variable, délai fixe. SS = Z · σ · √(Lp + Rp)
 * - `demandLead` : demande et délai variables. SS = Z · √((Lp + Rp) · σ² + μ² · σLp²)
 * - `coverage` : couverture simple. SS = (μ par jour) · jours de couverture
 */
export type SafetyMethod = 'demand' | 'demandLead' | 'coverage';

export const SAFETY_METHODS: readonly SafetyMethod[] = ['demand', 'demandLead', 'coverage'];

export interface PolicyInput {
  kind: PeriodKind;
  /** Consommation moyenne par période (μ). */
  mu: number;
  /** Écart-type de la consommation par période (σ, échantillon). */
  sigma: number;
  /** Délai d'approvisionnement L, en jours. */
  leadTimeDays: number;
  /** Période de revue R, en jours (0 = revue continue). */
  reviewDays: number;
  /** Écart-type du délai σL, en jours (0 si inconnu). */
  leadTimeSdDays: number;
  /** Taux de service cycle visé, entre 0,5 et 0,9999 (ex. 0,95). */
  serviceLevel: number;
  method: SafetyMethod;
  /** Jours de couverture, pour la méthode `coverage`. */
  coverageDays: number;
}

export interface PolicyResult {
  z: number;
  dpp: number;
  lp: number;
  rp: number;
  sigmaLp: number;
  muPerDay: number;
  /** Valeurs exactes (graphiques). */
  ss: number;
  rop: number;
  target: number;
  /** Valeurs arrondies à l'unité supérieure (tableau, export). */
  ssRounded: number;
  ropRounded: number;
  targetRounded: number;
}

export const MIN_SERVICE_LEVEL = 0.5;
export const MAX_SERVICE_LEVEL = 0.9999;

/**
 * Arrondi à l'unité supérieure. La tolérance de 1e-9 évite qu'une imprécision
 * binaire (ex. 24,000000000000004) ne fasse passer à 25.
 */
export function ceilUnit(x: number): number {
  // « || 0 » transforme −0 en 0 (Math.ceil(−1e-9) vaut −0).
  return Math.ceil(x - 1e-9) || 0;
}

export function zForServiceLevel(serviceLevel: number): number {
  if (!(serviceLevel >= MIN_SERVICE_LEVEL && serviceLevel <= MAX_SERVICE_LEVEL)) {
    throw new RangeError(`Taux de service hors bornes : ${serviceLevel}`);
  }
  return normInv(serviceLevel);
}

export function safetyStock(input: PolicyInput): number {
  const dpp = DAYS_PER_PERIOD[input.kind];
  const lp = input.leadTimeDays / dpp;
  const rp = input.reviewDays / dpp;
  switch (input.method) {
    case 'coverage':
      return (input.mu / dpp) * input.coverageDays;
    case 'demandLead': {
      const z = zForServiceLevel(input.serviceLevel);
      const sigmaLp = input.leadTimeSdDays / dpp;
      return z * Math.sqrt((lp + rp) * input.sigma ** 2 + input.mu ** 2 * sigmaLp ** 2);
    }
    case 'demand': {
      const z = zForServiceLevel(input.serviceLevel);
      return z * input.sigma * Math.sqrt(lp + rp);
    }
  }
}

export function computePolicy(input: PolicyInput): PolicyResult {
  for (const [k, v] of Object.entries({
    mu: input.mu,
    sigma: input.sigma,
    leadTimeDays: input.leadTimeDays,
    reviewDays: input.reviewDays,
    leadTimeSdDays: input.leadTimeSdDays,
    coverageDays: input.coverageDays,
  })) {
    if (!Number.isFinite(v) || v < 0) throw new RangeError(`${k} doit être un nombre ≥ 0`);
  }
  const dpp = DAYS_PER_PERIOD[input.kind];
  const lp = input.leadTimeDays / dpp;
  const rp = input.reviewDays / dpp;
  const sigmaLp = input.leadTimeSdDays / dpp;
  const z = zForServiceLevel(input.serviceLevel);
  // Un Z négatif (taux < 50 %) est exclu par les bornes : SS est toujours ≥ 0.
  const ss = Math.max(0, safetyStock(input));
  const rop = input.mu * lp + ss;
  const target = input.mu * (lp + rp) + ss;
  return {
    z,
    dpp,
    lp,
    rp,
    sigmaLp,
    muPerDay: input.mu / dpp,
    ss,
    rop,
    target,
    ssRounded: ceilUnit(ss),
    ropRounded: ceilUnit(rop),
    targetRounded: ceilUnit(target),
  };
}

/** Couverture en jours : stock ÷ consommation moyenne par jour. null si μ = 0. */
export function coverageInDays(stock: number, muPerDay: number): number | null {
  return muPerDay > 0 ? stock / muPerDay : null;
}
