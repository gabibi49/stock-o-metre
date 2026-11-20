import { describe, expect, it } from 'vitest';
import { classifyAbc, classifyXyz } from '../../src/engine/abcxyz';

const classes = (values: number[], t?: { a: number; b: number }): string[] => {
  const entries = classifyAbc(values, t);
  const out = new Array<string>(values.length);
  for (const e of entries) out[e.index] = e.abc;
  return out;
};

describe('classement ABC (80 / 15 / 5)', () => {
  it('exemple de référence', () => {
    // Total 1000. Part cumulée AVANT chaque article : 0 % (A), 50 % (A), 80 % (B), 90 % (B), 96 % (C)
    expect(classes([500, 300, 100, 60, 40])).toEqual(['A', 'A', 'B', 'B', 'C']);
  });

  it('l’ordre d’entrée n’a pas d’importance', () => {
    expect(classes([40, 100, 500, 60, 300])).toEqual(['C', 'B', 'A', 'B', 'A']);
  });

  it('un article très dominant reste A, le suivant B', () => {
    // [900, 50, 50] : avant = 0 % (A), 90 % (B), 95 % (C)
    expect(classes([900, 50, 50])).toEqual(['A', 'B', 'C']);
  });

  it('un seul article → A', () => {
    expect(classes([12])).toEqual(['A']);
  });

  it('tous à zéro → tous C', () => {
    expect(classes([0, 0, 0])).toEqual(['C', 'C', 'C']);
  });

  it('les valeurs nulles sont toujours C', () => {
    expect(classes([10, 0])).toEqual(['A', 'C']);
  });

  it('liste vide', () => {
    expect(classifyAbc([])).toEqual([]);
  });

  it('parts cumulées pour la courbe de Pareto', () => {
    const e = classifyAbc([500, 300, 100, 60, 40]);
    expect(e.map((x) => x.cumulativeShare)).toEqual([0.5, 0.8, 0.9, 0.96, 1]);
  });

  it('seuils modifiables (70 / 20 / 10)', () => {
    // avant : 0 (A), 50 (A), 80 → ≥ 70 et < 90 → B, 90 → C, 96 → C
    expect(classes([500, 300, 100, 60, 40], { a: 0.7, b: 0.2 })).toEqual(['A', 'A', 'B', 'C', 'C']);
  });

  it('refuse des seuils incohérents', () => {
    expect(() => classifyAbc([1], { a: 0.9, b: 0.2 })).toThrow(RangeError);
  });
});

describe('classement XYZ (CV : X < 0,5 ≤ Y ≤ 1 < Z)', () => {
  it.each([
    [0, 'X'],
    [0.49, 'X'],
    [0.5, 'Y'],
    [1, 'Y'],
    [1.01, 'Z'],
  ])('CV %s → %s', (cv, cls) => {
    expect(classifyXyz(cv)).toBe(cls);
  });
  it('CV non défini (μ = 0) → null', () => {
    expect(classifyXyz(null)).toBeNull();
  });
  it('seuils modifiables', () => {
    expect(classifyXyz(0.6, { x: 0.7, y: 1.5 })).toBe('X');
  });
});
