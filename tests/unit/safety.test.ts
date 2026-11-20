import { describe, expect, it } from 'vitest';
import { ceilUnit, computePolicy, coverageInDays, type PolicyInput } from '../../src/engine/safety';
import { mean, sampleStdDev, coefficientOfVariation, zeroShare } from '../../src/engine/stats';

/**
 * EXEMPLE 1 (calculé à la main) — période hebdomadaire.
 * Consommations : 10, 12, 8, 14, 6, 10, 12, 8 (n = 8).
 *   μ = 80 / 8 = 10
 *   Écarts à la moyenne : 0, 2, −2, 4, −4, 0, 2, −2 → carrés : 0, 4, 4, 16, 16, 0, 4, 4 → Σ = 48
 *   σ² = 48 / (8 − 1) = 6,857142857 → σ = 2,618614683
 * L = 14 jours → Lp = 14 / 7 = 2 ; R = 7 jours → Rp = 1 ; taux 95 % → Z = 1,644853627
 *   SS = Z · σ · √(Lp + Rp) = 1,644853627 × 2,618614683 × 1,732050808 = 7,460355
 *   Point de commande = μ · Lp + SS = 20 + 7,460355 = 27,460355 → 28
 *   Stock cible = μ · (Lp + Rp) + SS = 30 + 7,460355 = 37,460355 → 38
 */
const DEMAND_1 = [10, 12, 8, 14, 6, 10, 12, 8];

const base1: PolicyInput = {
  kind: 'week',
  mu: 10,
  sigma: Math.sqrt(48 / 7),
  leadTimeDays: 14,
  reviewDays: 7,
  leadTimeSdDays: 0,
  serviceLevel: 0.95,
  method: 'demand',
  coverageDays: 0,
};

describe('statistiques de base', () => {
  it('moyenne, écart-type d’échantillon (n − 1) et CV de l’exemple 1', () => {
    expect(mean(DEMAND_1)).toBe(10);
    expect(sampleStdDev(DEMAND_1)).toBeCloseTo(2.618614683, 9);
    expect(coefficientOfVariation(10, 2.618614683)).toBeCloseTo(0.2618614683, 9);
  });
  it('cas limites', () => {
    expect(mean([])).toBe(0);
    expect(sampleStdDev([5])).toBe(0);
    expect(coefficientOfVariation(0, 3)).toBeNull();
    expect(zeroShare([0, 0, 5, 0])).toBe(0.75);
    expect(zeroShare([])).toBe(0);
  });
});

describe('méthode 1 : demande variable', () => {
  it('exemple 1', () => {
    const r = computePolicy(base1);
    expect(r.lp).toBe(2);
    expect(r.rp).toBe(1);
    expect(r.z).toBeCloseTo(1.644853627, 8);
    expect(r.ss).toBeCloseTo(7.460355, 5);
    expect(r.rop).toBeCloseTo(27.460355, 5);
    expect(r.target).toBeCloseTo(37.460355, 5);
    expect([r.ssRounded, r.ropRounded, r.targetRounded]).toEqual([8, 28, 38]);
  });

  it('revue continue (R = 0) : stock cible = point de commande', () => {
    // SS = 1,644853627 × 2,618614683 × 1,414213562 = 4,307238 × 1,414213562 = 6,091354
    // PC = SC = 20 + 6,091354 = 26,09 → 27
    const r = computePolicy({ ...base1, reviewDays: 0 });
    expect(r.ss).toBeCloseTo(6.091354, 5);
    expect(r.rop).toBe(r.target);
    expect(r.ropRounded).toBe(27);
  });

  it('σ = 0 → SS = 0 (demande parfaitement régulière)', () => {
    const r = computePolicy({ ...base1, sigma: 0 });
    expect(r.ss).toBe(0);
    expect(r.ropRounded).toBe(20);
    expect(r.targetRounded).toBe(30);
  });
});

describe('méthode 2 : demande et délai variables', () => {
  /**
   * EXEMPLE 2 : données de l'exemple 1, σL = 7 jours → σLp = 1 période.
   *   SS = Z · √((Lp + Rp) · σ² + μ² · σLp²) = 1,644853627 × √(3 × 6,857142857 + 100 × 1)
   *      = 1,644853627 × √120,571428571 = 1,644853627 × 10,980502 = 18,061318
   *   PC = 20 + 18,061318 = 38,06 → 39 ; SC = 30 + 18,061318 = 48,06 → 49
   */
  it('exemple 2', () => {
    const r = computePolicy({ ...base1, method: 'demandLead', leadTimeSdDays: 7 });
    expect(r.sigmaLp).toBe(1);
    expect(r.ss).toBeCloseTo(18.061318, 5);
    expect([r.ssRounded, r.ropRounded, r.targetRounded]).toEqual([19, 39, 49]);
  });

  it('avec σL = 0, identique à la méthode 1', () => {
    const a = computePolicy({ ...base1, method: 'demandLead', leadTimeSdDays: 0 });
    const b = computePolicy(base1);
    expect(a.ss).toBeCloseTo(b.ss, 12);
  });
});

describe('méthode 3 : couverture simple', () => {
  /**
   * EXEMPLE 3 : période mensuelle, μ = 304,375 / mois → μ par jour = 304,375 / 30,4375 = 10.
   *   Couverture 5 jours → SS = 10 × 5 = 50
   *   L = 30,4375 jours → Lp = 1 ; R = 0 → PC = SC = 304,375 + 50 = 354,375 → 355
   */
  it('exemple 3', () => {
    const r = computePolicy({
      ...base1,
      kind: 'month',
      mu: 304.375,
      sigma: 40,
      leadTimeDays: 30.4375,
      reviewDays: 0,
      method: 'coverage',
      coverageDays: 5,
    });
    expect(r.muPerDay).toBe(10);
    expect(r.ss).toBe(50);
    expect(r.rop).toBe(354.375);
    expect(r.target).toBe(354.375);
    expect(r.targetRounded).toBe(355);
  });
});

describe('conversions et arrondis', () => {
  it('mois = 30,4375 jours', () => {
    const r = computePolicy({ ...base1, kind: 'month', leadTimeDays: 60.875, reviewDays: 0 });
    expect(r.lp).toBe(2);
  });
  it('arrondi à l’unité supérieure tolérant aux imprécisions binaires', () => {
    expect(ceilUnit(24.000000000000004)).toBe(24);
    expect(ceilUnit(24.1)).toBe(25);
    expect(ceilUnit(0)).toBe(0);
    expect(ceilUnit(0.1 + 0.2)).toBe(1);
  });
  it('refuse les entrées invalides', () => {
    expect(() => computePolicy({ ...base1, leadTimeDays: -1 })).toThrow(RangeError);
    expect(() => computePolicy({ ...base1, serviceLevel: 1 })).toThrow(RangeError);
    expect(() => computePolicy({ ...base1, serviceLevel: 0.3 })).toThrow(RangeError);
  });
});

describe('couverture en jours', () => {
  it('stock ÷ μ par jour', () => {
    // 150 unités, 10 / jour → 15 jours
    expect(coverageInDays(150, 10)).toBe(15);
    expect(coverageInDays(150, 0)).toBeNull();
  });
});
