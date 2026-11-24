/**
 * Vérifie les corrections des exercices (src/content/exercises) : chaque
 * résultat est recalculé ici avec le moteur du site, puis on contrôle qu'il
 * figure, arrondi comme dans le texte, dans les versions FR et EN.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classifyAbc } from '../../src/engine/abcxyz';
import { normInv } from '../../src/engine/normal';
import { ceilUnit } from '../../src/engine/safety';
import { mean, sampleStdDev } from '../../src/engine/stats';

const DIR = join(__dirname, '../../src/content/exercises');
const read = (lang: 'fr' | 'en', id: string) => readFileSync(join(DIR, lang, `${id}.md`), 'utf8');

/** Formate comme dans les textes : FR « 1 234,56 », EN « 1,234.56 ». */
function num(x: number, digits: number, lang: 'fr' | 'en'): string {
  const [int, dec] = Math.abs(x).toFixed(digits).split('.') as [string, string | undefined];
  const sep = lang === 'fr' ? ' ' : ',';
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const sign = x < 0 ? '−' : '';
  return sign + grouped + (dec ? (lang === 'fr' ? ',' : '.') + dec : '');
}

/** Vérifie que chaque valeur apparaît dans les deux langues. */
function expectIn(id: string, values: Array<[number, number]>) {
  for (const lang of ['fr', 'en'] as const) {
    const text = read(lang, id);
    for (const [v, d] of values) {
      expect(text, `${id} (${lang}) doit contenir ${num(v, d, lang)}`).toContain(num(v, d, lang));
    }
  }
}

const phi = (z: number) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI);
/** Fonction de répartition par intégration de Simpson (précision ~1e-12). */
function Phi(z: number): number {
  if (z < 0) return 1 - Phi(-z);
  const n = 2000;
  const h = z / n;
  let s = 0;
  for (let i = 0; i <= n; i++) s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * phi(i * h);
  return 0.5 + (s * h) / 3;
}
const lossG = (z: number) => phi(z) - z * (1 - Phi(z));

describe('exercices : structure', () => {
  it('chaque exercice existe en FR et en EN, avec une correction en étapes', () => {
    const fr = readdirSync(join(DIR, 'fr')).sort();
    const en = readdirSync(join(DIR, 'en')).sort();
    expect(fr).toEqual(en);
    expect(fr.length).toBeGreaterThanOrEqual(10);
    for (const file of fr) {
      const id = file.replace(/\.md$/, '');
      expect(read('fr', id)).toMatch(/^## Correction$[\s\S]*^### /m);
      expect(read('en', id)).toMatch(/^## Solution$[\s\S]*^### /m);
    }
  });
});

describe('exercices : calculs', () => {
  it('stock de sécurité, débutant', () => {
    const d = [180, 220, 210, 160, 240, 190, 200, 200];
    const s = sampleStdDev(d);
    expect(mean(d)).toBe(200);
    const ss95 = normInv(0.95) * s * Math.sqrt(3);
    const ss99 = normInv(0.99) * s * Math.sqrt(3);
    expect(ceilUnit(ss95)).toBe(70);
    expect(ceilUnit(ss99)).toBe(99);
    expectIn('safety-beginner', [
      [s, 2],
      [ss95, 2],
      [ss99, 2],
    ]);
  });

  it('stock de sécurité, délai variable', () => {
    const z = normInv(0.98);
    const a = z * 15 * Math.sqrt(12);
    const b = z * Math.sqrt(12 * 15 ** 2 + 50 ** 2 * 3 ** 2);
    const b1 = z * Math.sqrt(12 * 15 ** 2 + 50 ** 2 * 1 ** 2);
    expect([ceilUnit(a), ceilUnit(b), ceilUnit(b1)]).toEqual([107, 327, 149]);
    const saving = (ceilUnit(b) - ceilUnit(b1)) * 8 * 0.25;
    expect(saving).toBe(356);
    expect(12500 * 0.1).toBe(1250);
    expectIn('safety-certification', [
      [a, 2],
      [b, 2],
      [b1, 2],
      [Math.sqrt(25200), 2],
      [654, 0],
      [356, 0],
      [1250, 0],
    ]);
  });

  it('point de commande, débutant', () => {
    expect(30 * 8 + 60).toBe(300);
    expect((420 - 300) / 30).toBe(4);
    expect(300 - 30 * 8).toBe(60);
  });

  it('point de commande, position de stock', () => {
    const z = normInv(0.97);
    const ss = z * 18 * Math.sqrt(6);
    const rop = 60 * 6 + ss;
    const ss9 = z * 18 * 3;
    const rop9 = 60 * 9 + ss9;
    expect([ceilUnit(ss), ceilUnit(rop), ceilUnit(ss9), ceilUnit(rop9)]).toEqual([
      83, 443, 102, 642,
    ]);
    const position = 380 + 150 - 40;
    expect(position).toBe(490);
    expect(position > ceilUnit(rop) && position - 60 < ceilUnit(rop)).toBe(true);
    expectIn('rop-certification', [
      [ss, 2],
      [rop, 2],
      [ss9, 2],
      [rop9, 2],
    ]);
  });

  it('Wilson, débutant', () => {
    const q = Math.sqrt((2 * 12000 * 60) / 4);
    expect(q).toBe(600);
    const tc = (qq: number) => (12000 / qq) * 60 + (qq / 2) * 4;
    expect(tc(600)).toBe(2400);
    expect(tc(1000)).toBe(2720);
    expectIn('eoq-beginner', [
      [365 / 20, 2],
      [(tc(1000) / tc(600) - 1) * 100, 1],
    ]);
  });

  it('Wilson, remises quantitatives', () => {
    const D = 5000;
    const S = 100;
    const tc = (price: number, q: number) => D * price + (D / q) * S + (q / 2) * price * 0.25;
    const eoq = (price: number) => Math.sqrt((2 * D * S) / (price * 0.25));
    expect(eoq(10)).toBeGreaterThan(499); // tranche écartée
    expect(eoq(9.6)).toBeGreaterThanOrEqual(500);
    expect(eoq(9.6)).toBeLessThan(1000);
    expect(eoq(9.3)).toBeLessThan(1000);
    const best = Math.min(tc(9.6, 645), tc(9.3, 1000));
    expect(best).toBe(tc(9.3, 1000));
    expect(tc(10, 499)).toBeGreaterThan(tc(9.6, 500));
    expectIn('eoq-certification', [
      [eoq(10), 1],
      [eoq(9.6), 1],
      [eoq(9.3), 1],
      [(D / 645) * S, 2],
      [tc(9.6, 645), 2],
      [tc(9.3, 1000), 2],
      [tc(10, 499), 2],
      [tc(9.6, 645) - tc(9.3, 1000), 2],
    ]);
  });

  it('ABC, débutant (règle du moteur Stock-o-mètre)', () => {
    const items: Array<[string, number, number]> = [
      ['V-101', 25000, 0.1],
      ['M-210', 300, 300],
      ['R-330', 4000, 15],
      ['C-115', 250, 80],
      ['J-402', 10000, 0.05],
      ['P-118', 600, 20],
      ['E-207', 20000, 0.075],
      ['K-512', 140, 50],
      ['T-650', 1100, 5],
      ['F-090', 400, 2.5],
    ];
    const res = classifyAbc(items.map(([, q, p]) => q * p));
    const classes = Object.fromEntries(res.map((r) => [items[r.index]?.[0], r.abc]));
    expect(classes).toEqual({
      'M-210': 'A',
      'R-330': 'A',
      'C-115': 'A',
      'P-118': 'B',
      'K-512': 'B',
      'T-650': 'B',
      'V-101': 'C',
      'E-207': 'C',
      'F-090': 'C',
      'J-402': 'C',
    });
    expectIn(
      'abc-beginner',
      res.map((r) => [r.cumulativeShare * 100, 2] as [number, number]),
    );
  });

  it('ABC-XYZ, certification', () => {
    const items: Array<[string, number[], number]> = [
      ['P-01', [100, 110, 95, 105, 100, 90], 55],
      ['P-02', [40, 0, 120, 10, 0, 70], 200],
      ['P-03', [250, 380, 60, 330, 120, 60], 8],
      ['P-04', [500, 520, 480, 510, 490, 500], 2],
      ['P-05', [30, 0, 0, 90, 0, 0], 15],
      ['P-06', [60, 80, 40, 90, 50, 40], 6],
    ];
    const values = items.map(([, d, p]) => d.reduce((a, b) => a + b, 0) * p);
    const res = classifyAbc(values);
    const abc = Object.fromEntries(res.map((r) => [items[r.index]?.[0], r.abc]));
    expect(abc).toEqual({
      'P-01': 'A',
      'P-02': 'A',
      'P-03': 'B',
      'P-04': 'B',
      'P-05': 'C',
      'P-06': 'C',
    });
    const cvs = items.map(([, d]) => sampleStdDev(d) / mean(d));
    const xyz = cvs.map((cv) => (cv < 0.5 ? 'X' : cv <= 1 ? 'Y' : 'Z'));
    expect(xyz).toEqual(['X', 'Z', 'Y', 'X', 'Z', 'X']);
    // Z arrondi à 4 décimales, comme donné dans l'énoncé.
    const z = 2.0537;
    expect(normInv(0.98)).toBeCloseTo(z, 4);
    const ss1 = z * sampleStdDev(items[0]?.[1] ?? []);
    const ss2 = z * sampleStdDev(items[1]?.[1] ?? []);
    expect([ceilUnit(ss1), ceilUnit(ss2)]).toEqual([15, 99]);
    expectIn('abc-certification', [
      ...res.map((r) => [r.share * 100, 2] as [number, number]),
      ...items.map(([, d]) => [sampleStdDev(d), 2] as [number, number]),
      ...cvs.map((cv) => [cv, 2] as [number, number]),
      [ss1, 2],
      [ss2, 2],
    ]);
  });

  it('taux de service, débutant', () => {
    const demand = [380, 420, 410, 450, 390, 370, 400, 430, 360, 390];
    expect(demand.reduce((a, b) => a + b, 0)).toBe(4000);
    expectIn('service-beginner', [
      [(1 - 42 / 4000) * 100, 2],
      [(244 / 250) * 100, 1],
    ]);
  });

  it('taux de service, fonction de perte normale', () => {
    const z90 = normInv(0.9);
    expect(phi(z90)).toBeCloseTo(0.1755, 4);
    const g90 = lossG(z90);
    expect(g90).toBeCloseTo(0.0473, 4);
    expect((1 - (100 * g90) / 500) * 100).toBeCloseTo(99.05, 2);
    // Table de l'énoncé : valeurs exactes à 5 décimales.
    const table: Array<[number, number]> = [
      [1.5, 0.02931],
      [1.6, 0.02324],
      [1.7, 0.01829],
      [1.8, 0.01428],
      [1.9, 0.01105],
      [2.0, 0.00849],
      [2.1, 0.00647],
    ];
    for (const [zz, g] of table) expect(lossG(zz)).toBeCloseTo(g, 5);
    // Interpolation de l'énoncé, puis contrôle par résolution exacte.
    const solve = (target: number) => {
      let lo = 0;
      let hi = 4;
      for (let i = 0; i < 80; i++) {
        const m = (lo + hi) / 2;
        if (lossG(m) > target) lo = m;
        else hi = m;
      }
      return lo;
    };
    expect(solve(0.01)).toBeCloseTo(1.94, 2);
    expect(solve(0.025)).toBeCloseTo(1.57, 2);
    expect(Phi(1.94) * 100).toBeCloseTo(97.4, 1);
    expect(Phi(1.57) * 100).toBeCloseTo(94.2, 1);
    expectIn('service-certification', [
      [100 * 0.0473, 2],
      [(1 - (100 * 0.0473) / 500) * 100, 2],
    ]);
  });
});
