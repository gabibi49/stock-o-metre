import { describe, expect, it } from 'vitest';
import { csvCell, sanitizeText, toCsv } from '../../src/lib/csvExport';
import {
  coverageFormula,
  makeFormatter,
  ropFormula,
  safetyFormula,
  targetFormula,
} from '../../src/lib/formulas';

describe('export CSV : protection contre l’injection de formules', () => {
  it.each([
    ['=SOMME(A1:A9)', "'=SOMME(A1:A9)"],
    ['+33 1 23', "'+33 1 23"],
    ['-2+3', "'-2+3"],
    ['@cmd', "'@cmd"],
    ['\tTAB', "'\tTAB"],
    ['\rCR', "'\rCR"],
    ['Vis M8', 'Vis M8'],
    ['', ''],
  ])('« %s » → « %s »', (input, expected) => {
    expect(sanitizeText(input)).toBe(expected);
  });

  it('les nombres calculés ne sont pas préfixés et suivent le format décimal', () => {
    expect(csvCell(-12.5, { delimiter: ';', decimal: ',' })).toBe('-12,5');
    expect(csvCell(1234.5, { delimiter: ',', decimal: '.' })).toBe('1234.5');
    expect(csvCell(null, { delimiter: ';', decimal: ',' })).toBe('');
  });

  it('guillemets et séparateurs échappés', () => {
    expect(csvCell('a;b', { delimiter: ';', decimal: ',' })).toBe('"a;b"');
    expect(csvCell('dit "x"', { delimiter: ';', decimal: ',' })).toBe('"dit ""x"""');
    // Texte dangereux ET contenant le séparateur : préfixé puis mis entre guillemets
    expect(csvCell('=1;2', { delimiter: ';', decimal: ',' })).toBe(`"'=1;2"`);
  });

  it('fichier complet : BOM UTF-8, CRLF', () => {
    const csv = toCsv(
      [
        ['article', 'qté'],
        ['=HACK()', 3.5],
      ],
      { delimiter: ';', decimal: ',' },
    );
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe("article;qté\r\n'=HACK();3,5\r\n");
  });
});

describe('formules affichées avec les valeurs', () => {
  const f = makeFormatter('fr-FR');
  const s = { ss: 'SS', rop: 'PC', target: 'SC', cover: 'Couverture', days: 'jours' };

  it('stock de sécurité, exemple 1 des tests de calcul', () => {
    const lines = safetyFormula(
      {
        method: 'demand',
        z: 1.644853627,
        mu: 10,
        sigma: 2.618614683,
        lp: 2,
        rp: 1,
        sigmaLp: 0,
        dpp: 7,
        coverageDays: 0,
        ss: 7.460355,
      },
      s,
      f,
    );
    expect(lines).toEqual(['SS = Z × σ × √(Lp + Rp)', '= 1,6449 × 2,62 × √(2 + 1)', '= 7,46 → 8']);
  });

  it('point de commande, stock cible, couverture', () => {
    expect(ropFormula(10, 2, 7.460355, s, f)).toEqual([
      'PC = μ × Lp + SS',
      '= 10 × 2 + 7,46',
      '= 27,46 → 28',
    ]);
    expect(targetFormula(10, 2, 1, 7.460355, s, f).at(-1)).toBe('= 37,46 → 38');
    expect(coverageFormula(150, 10, s, f)).toEqual(['Couverture = 150 ÷ 10', '= 15 jours']);
    expect(coverageFormula(150, 0, s, f)[0]).toContain('∞');
  });
});
