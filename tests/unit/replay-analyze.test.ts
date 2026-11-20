import { describe, expect, it } from 'vitest';
import { replayStock, stockoutIntervals } from '../../src/engine/replay';
import { aggregateDataset } from '../../src/engine/aggregate';
import { computeAnalysis, DEFAULT_PARAMS, type ItemResult } from '../../src/engine/analyze';
import { dayFromYmd } from '../../src/engine/dates';
import type { Dataset, ItemData } from '../../src/engine/types';

describe('stock reconstitué', () => {
  // Mouvements nets : jour 1 : +10, jour 3 : −4, jour 5 : −8 (total −2). Fichier : jours 1 à 10.
  it('à partir du stock actuel, en remontant le temps', () => {
    // Stock actuel 20 → stock d'ouverture = 20 − (−2) = 22 ; puis 32, 28, 20.
    const s = replayStock([1, 3, 5], [10, -4, -8], 20, 1, 10);
    expect(s.absolute).toBe(true);
    expect(s.opening).toBe(22);
    expect(s.days).toEqual([0, 1, 3, 5, 10]);
    expect(s.stock).toEqual([22, 32, 28, 20, 20]);
    expect(s.closing).toBe(20);
    expect(s.min).toBe(20);
  });

  it('sans stock actuel : départ à 0 (courbe relative)', () => {
    const s = replayStock([1, 3, 5], [10, -4, -8], null, 1, 10);
    expect(s.absolute).toBe(false);
    expect(s.stock).toEqual([0, 10, 6, -2, -2]);
    expect(s.min).toBe(-2);
    // Le stock ≤ 0 du début (ouverture à 0) puis à partir du jour 5
    expect(stockoutIntervals(s)).toEqual([
      [0, 1],
      [5, 10],
    ]);
  });

  it('stock reconstitué négatif = mouvements manquants', () => {
    const s = replayStock([2, 4], [-30, 5], 0, 1, 5);
    // ouverture = 0 − (−25) = 25 ; puis −5, 0
    expect(s.stock).toEqual([25, -5, 0, 0]);
    expect(s.min).toBe(-5);
  });

  it('pas d’erreur d’arrondi binaire cumulée', () => {
    const s = replayStock([1, 2, 3], [0.1, 0.2, -0.3], null, 1, 3);
    expect(s.closing).toBe(0);
  });
});

describe('analyse complète', () => {
  const D = (m: number, d: number): number => dayFromYmd(2025, m, d);
  // Fichier du lundi 6 janvier au dimanche 2 mars 2025 = 8 semaines complètes.
  const mk = (p: Partial<ItemData> & Pick<ItemData, 'id'>): ItemData => ({
    label: p.id,
    price: null,
    stockFromFile: null,
    firstDay: D(1, 6),
    consDays: [],
    consQty: [],
    moveDays: [],
    moveNets: [],
    duplicates: 0,
    lines: 0,
    ...p,
  });
  const weekly = (qty: number[]): { consDays: number[]; consQty: number[] } => ({
    consDays: qty.map((_, i) => D(1, 6) + i * 7 + 1),
    consQty: qty,
  });
  const ds: Dataset = {
    fileFirstDay: D(1, 6),
    fileLastDay: D(3, 2),
    hasPrice: true,
    items: [
      // Exemple 1 des tests de formules : μ = 10, σ = 2,6186
      mk({ id: 'A1', price: 5, stockFromFile: 40, ...weekly([10, 12, 8, 14, 6, 10, 12, 8]) }),
      // Intermittent : 5 semaines sur 8 à zéro
      mk({ id: 'B2', price: 1, ...weekly([0, 0, 9, 0, 0, 3, 0, 1]), duplicates: 2 }),
      // Aucune sortie, pas de prix
      mk({ id: 'C3', moveDays: [D(1, 7)], moveNets: [-5], stockFromFile: 1 }),
    ],
  };
  const agg = aggregateDataset(ds, 'week');
  const res = computeAnalysis(ds, agg, DEFAULT_PARAMS);
  const [a, b, c] = res.results as [ItemResult, ItemResult, ItemResult];

  it('8 périodes, rien d’exclu', () => {
    expect(res.periodCount).toBe(8);
    expect(res.droppedFirst).toBeNull();
    expect(res.droppedLast).toBeNull();
    expect(res.abcBasis).toBe('value');
  });

  it('classement ABC sur la valeur', () => {
    // Valeurs : A1 = 80 × 5 = 400 ; B2 = 13 × 1 = 13 ; C3 = 0 → total 413
    // Avant : A1 0 % → A ; B2 96,9 % → C ; C3 valeur nulle → C
    expect([a.abc, b.abc, c.abc]).toEqual(['A', 'C', 'C']);
    expect(a.abcValue).toBe(400);
  });

  it('calculs de l’article A1 (classe A → 98 %, L = 14 j, R = 7 j)', () => {
    // Z(98 %) = 2,0537489 ; SS = 2,0537489 × 2,6186147 × 1,7320508 = 5,377977 × 1,7320508 = 9,314930 → 10
    // PC = 20 + 9,3149 = 29,31 → 30 ; SC = 30 + 9,3149 = 39,31 → 40
    expect(a.policy.ss).toBeCloseTo(9.31493, 5);
    expect([a.policy.ssRounded, a.policy.ropRounded, a.policy.targetRounded]).toEqual([10, 30, 40]);
    expect(a.xyz).toBe('X');
    // Stock actuel 40, cible 40 → écart 0 ; couverture = 40 ÷ (10 / 7) = 28 jours
    expect(a.gap).toBe(0);
    expect(a.coverageDays).toBeCloseTo(28, 9);
    expect(a.alerts).toEqual([]);
  });

  it('alertes : intermittence et doublons', () => {
    expect(b.alerts).toContain('intermittent');
    expect(b.alerts).toContain('duplicates');
    expect(b.xyz).toBe('Z');
  });

  it('alertes : demande nulle, prix manquant, stock reconstitué négatif', () => {
    // C3 : stock actuel 1, une sortie de stock de 5 sans consommation → ouverture 6, pas négatif
    expect(c.alerts).toEqual(expect.arrayContaining(['zeroDemand', 'noPrice']));
    expect(c.alerts).not.toContain('negativeStock');
    expect(c.coverageDays).toBeNull();
    expect(c.xyz).toBeNull();
  });

  it('paramètres par article et stock saisi', () => {
    const r2 = computeAnalysis(
      ds,
      agg,
      DEFAULT_PARAMS,
      new Map([
        [0, { serviceLevel: 0.95, currentStock: 50 }],
        [2, { currentStock: -10 }],
      ]),
    );
    const a2 = r2.results[0]!;
    expect(a2.policy.ss).toBeCloseTo(7.460355, 5);
    expect(a2.gap).toBe(50 - 38);
    expect(a2.gapValue).toBe(12 * 5);
    expect(a2.overridden.sort()).toEqual(['currentStock', 'serviceLevel']);
    expect(r2.results[2]!.alerts).toContain('negativeStock');
  });

  it('historique court', () => {
    const short: Dataset = { ...ds, fileLastDay: D(1, 26), items: [ds.items[0]!] };
    const r = computeAnalysis(short, aggregateDataset(short, 'week'), DEFAULT_PARAMS);
    expect(r.results[0]!.n).toBe(3);
    expect(r.results[0]!.alerts).toContain('shortHistory');
  });

  it('ABC sur la quantité sans prix', () => {
    const noPrice: Dataset = { ...ds, hasPrice: false };
    const r = computeAnalysis(noPrice, agg, DEFAULT_PARAMS);
    expect(r.abcBasis).toBe('quantity');
    expect(r.results[0]!.abcValue).toBe(80);
    expect(r.results[2]!.alerts).not.toContain('noPrice');
  });
});
