import { describe, expect, it } from 'vitest';
import { normInv } from '../../src/engine/normal';

/**
 * Valeurs de référence : tables de la loi normale centrée réduite
 * (quantiles usuels, à 10 décimales).
 */
describe('normInv (algorithme d’Acklam)', () => {
  it.each([
    [0.9, 1.2815515655],
    [0.95, 1.644853627],
    [0.975, 1.9599639845],
    [0.98, 2.0537489106],
    [0.99, 2.326347874],
    [0.995, 2.5758293035],
    [0.999, 3.0902323062],
    [0.5, 0],
    [0.84134474607, 1], // Φ(1)
  ])('Φ⁻¹(%s) ≈ %s', (p, z) => {
    expect(normInv(p)).toBeCloseTo(z, 7);
  });

  it('valeurs demandées par le cahier des charges (4 décimales)', () => {
    expect(normInv(0.9).toFixed(4)).toBe('1.2816');
    expect(normInv(0.95).toFixed(4)).toBe('1.6449');
    expect(normInv(0.98).toFixed(4)).toBe('2.0537');
    expect(normInv(0.99).toFixed(4)).toBe('2.3263');
  });

  it('est antisymétrique et couvre les queues basses (région p < 0,02425)', () => {
    expect(normInv(0.01)).toBeCloseTo(-2.326347874, 7);
    expect(normInv(0.001)).toBeCloseTo(-3.0902323062, 7);
    expect(normInv(0.02)).toBeCloseTo(-normInv(0.98), 9);
  });

  it('refuse p hors de ]0 ; 1[', () => {
    expect(() => normInv(0)).toThrow(RangeError);
    expect(() => normInv(1)).toThrow(RangeError);
    expect(() => normInv(Number.NaN)).toThrow(RangeError);
  });
});
