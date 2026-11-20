import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decodeBytes } from '../../src/csv/decode';
import { detectDelimiter } from '../../src/csv/sniff';
import { detectDecimalSeparator, parseNumber } from '../../src/csv/numbers';
import { detectDateOrder, parseDate } from '../../src/csv/dates';
import { autoMap, headerSignature, missingRequired, normalizeHeader } from '../../src/csv/mapping';
import { parseCsvText, TooManyRowsError } from '../../src/csv/parse';
import {
  buildDataset,
  distinctValues,
  guessMoveClass,
  sampleColumn,
  type MoveClass,
} from '../../src/csv/build';
import { dayFromYmd } from '../../src/engine/dates';

const enc = (s: string): Uint8Array => new TextEncoder().encode(s);

/** Encode en Windows-1252 les caractères utilisés dans les tests (Latin-1 + quelques signes). */
function encode1252(s: string): Uint8Array {
  const special: Record<string, number> = { '€': 0x80, '’': 0x92, œ: 0x9c };
  return Uint8Array.from([...s].map((c) => special[c] ?? c.charCodeAt(0)));
}

describe('encodage', () => {
  it('UTF-8 sans BOM', () => {
    const r = decodeBytes(enc('libellé;qté\nÉcrou;3'));
    expect(r.encoding).toBe('utf-8');
    expect(r.text).toBe('libellé;qté\nÉcrou;3');
  });
  it('UTF-8 avec BOM (retiré)', () => {
    const r = decodeBytes(Uint8Array.from([0xef, 0xbb, 0xbf, ...enc('date;article')]));
    expect(r.encoding).toBe('utf-8-bom');
    expect(r.text).toBe('date;article');
  });
  it('Windows-1252 avec accents', () => {
    const r = decodeBytes(encode1252('libellé;quantité\nÉcrou à œil;12,5 €'));
    expect(r.encoding).toBe('windows-1252');
    expect(r.text).toBe('libellé;quantité\nÉcrou à œil;12,5 €');
  });
  it('ASCII pur → UTF-8', () => {
    expect(decodeBytes(enc('a,b\n1,2')).encoding).toBe('utf-8');
  });
});

describe('séparateur de colonnes', () => {
  it('point-virgule, même avec des virgules décimales', () => {
    expect(
      detectDelimiter('date;article;qte;prix\n01/01/2025;A;12,5;0,35\n02/01/2025;B;3;1,2\n'),
    ).toBe(';');
  });
  it('virgule', () => {
    expect(detectDelimiter('date,item,qty\n2025-01-01,A,12.5\n2025-01-02,B,3\n')).toBe(',');
  });
  it('tabulation', () => {
    expect(detectDelimiter('date\titem\tqty\n2025-01-01\tA\t1\n')).toBe('\t');
  });
  it('ignore les séparateurs entre guillemets', () => {
    expect(detectDelimiter('date,item,label\n2025-01-01,A,"x; y; z"\n2025-01-02,B,"a; b"\n')).toBe(
      ',',
    );
  });
});

describe('nombres', () => {
  it.each([
    ['12,5', ',', 12.5],
    ['1 234,56', ',', 1234.56],
    ['1 234,56', ',', 1234.56], // espace insécable
    ['1 234', ',', 1234], // espace fine insécable
    ['1.234,56', ',', 1234.56],
    ['-3', ',', -3],
    ['12-', ',', -12], // signe en fin (certains ERP)
    ['(7,5)', ',', -7.5],
    ['+4', ',', 4],
    [',5', ',', 0.5],
    ['1,234.56', '.', 1234.56],
    ['1234.5', '.', 1234.5],
    ["1'234.5", '.', 1234.5],
    ['0', '.', 0],
  ] as const)('« %s » (décimale %s) → %s', (raw, dec, expected) => {
    expect(parseNumber(raw, dec)).toBe(expected);
  });
  it.each([
    ['', ','],
    ['abc', ','],
    ['1.5', ','], // ambigu dans un fichier à virgule décimale : refusé plutôt que lu 15
    ['12,3,4', ','],
    ['1,23', '.'],
    ['--3', ','],
  ] as const)('« %s » (décimale %s) → illisible', (raw, dec) => {
    expect(parseNumber(raw, dec)).toBeNull();
  });

  it('détection du séparateur décimal', () => {
    expect(detectDecimalSeparator(['12,5', '3', '0,35'], ';')).toBe(',');
    expect(detectDecimalSeparator(['12.5', '3', '1,234.5'], ',')).toBe('.');
    expect(detectDecimalSeparator(['1.234,5'], ',')).toBe(',');
    expect(detectDecimalSeparator(['0,333'], ',')).toBe(',');
    expect(detectDecimalSeparator(['1,234,567'], ';')).toBe('.');
    // Aucun indice : usage selon le séparateur de colonnes
    expect(detectDecimalSeparator(['3', '1,234'], ';')).toBe(',');
    expect(detectDecimalSeparator(['3', '12'], ',')).toBe('.');
  });
});

describe('dates', () => {
  const D = dayFromYmd;
  it.each([
    ['31/01/2025', 'dmy', D(2025, 1, 31)],
    ['31.01.2025', 'dmy', D(2025, 1, 31)],
    ['31-01-2025', 'dmy', D(2025, 1, 31)],
    ['2025-01-31', 'dmy', D(2025, 1, 31)], // l'année en tête impose aaaa-mm-jj
    ['2025/01/31', 'mdy', D(2025, 1, 31)],
    ['01/31/2025', 'mdy', D(2025, 1, 31)],
    ['31/01/2025 14:30', 'dmy', D(2025, 1, 31)],
    ['31/01/2025 14:30:59', 'dmy', D(2025, 1, 31)],
    ['2025-01-31T23:59:00.000Z', 'dmy', D(2025, 1, 31)],
    ['2025-01-31 08:00:00+02:00', 'dmy', D(2025, 1, 31)],
    ['5/3/25', 'dmy', D(2025, 3, 5)],
    ['29/02/2024', 'dmy', D(2024, 2, 29)],
  ] as const)('« %s » (%s)', (raw, order, day) => {
    expect(parseDate(raw, order)).toBe(day);
  });
  it.each([
    '31/02/2025',
    '29/02/2025',
    '2025-13-01',
    '32/01/2025',
    '31/01/2025 25:00',
    'hier',
    '',
    '2025-01',
  ])('« %s » → illisible', (raw) => {
    expect(parseDate(raw, 'dmy')).toBeNull();
  });
  it('détection de l’ordre', () => {
    expect(detectDateOrder(['2025-01-02', '2025-03-04'])).toEqual({
      order: 'ymd',
      ambiguous: false,
    });
    expect(detectDateOrder(['01/02/2025', '25/02/2025'])).toEqual({
      order: 'dmy',
      ambiguous: false,
    });
    expect(detectDateOrder(['01/02/2025', '02/25/2025'])).toEqual({
      order: 'mdy',
      ambiguous: false,
    });
    // Toutes les valeurs ≤ 12 : impossible de trancher → on demande au visiteur
    expect(detectDateOrder(['01/02/2025', '03/04/2025'])).toEqual({
      order: 'dmy',
      ambiguous: true,
    });
  });
});

describe('association automatique des colonnes', () => {
  it('modèle français', () => {
    const m = autoMap([
      'date',
      'article',
      'libellé',
      'quantité',
      'type_mouvement',
      'prix_unitaire',
    ]);
    expect(m).toEqual({ date: 0, item: 1, label: 2, qty: 3, type: 4, price: 5, stock: null });
  });
  it('synonymes usuels', () => {
    const m = autoMap([
      'Date mvt',
      'Code article',
      'Désignation',
      'Qté',
      'Sens',
      'PU',
      'Stock actuel',
    ]);
    expect(m).toEqual({ date: 0, item: 1, label: 2, qty: 3, type: 4, price: 5, stock: 6 });
  });
  it('anglais', () => {
    const m = autoMap([
      'Posting Date',
      'SKU',
      'Item description',
      'Qty',
      'Movement type',
      'Unit cost',
      'On hand',
    ]);
    expect(m).toEqual({ date: 0, item: 1, label: 2, qty: 3, type: 4, price: 5, stock: 6 });
  });
  it('« quantité en stock » est le stock, pas la quantité du mouvement', () => {
    const m = autoMap(['Référence', 'Date', 'Quantité', 'Quantité en stock']);
    expect(m.qty).toBe(2);
    expect(m.stock).toBe(3);
    expect(m.item).toBe(0);
  });
  it('colonnes obligatoires manquantes', () => {
    expect(missingRequired(autoMap(['foo', 'bar']))).toEqual(['date', 'item', 'qty']);
  });
  it('normalisation et signature', () => {
    expect(normalizeHeader('  Qté_Mvt. ')).toBe('qte mvt');
    expect(headerSignature(['Date', 'Qté'])).toBe('date|qte');
  });
});

describe('lecture CSV (Papa Parse)', () => {
  it('lignes vides ignorées, numéros de ligne conservés, champ multiligne', () => {
    const t = parseCsvText(
      'date;article\r\n\r\n01/01/2025;A\n"02/01/2025";"B\nsuite"\n\n03/01/2025;C\n',
      ';',
    );
    expect(t.header).toEqual(['date', 'article']);
    expect(t.rows.map((r) => r[1])).toEqual(['A', 'B\nsuite', 'C']);
    expect(t.lines).toEqual([3, 4, 7]);
  });
  it('limite du nombre de lignes', () => {
    expect(() => parseCsvText('a;b\n1;2\n3;4\n5;6\n', ';', undefined, 2)).toThrow(TooManyRowsError);
  });
});

describe('construction des données', () => {
  const mapping = { date: 0, item: 1, qty: 2, type: 3, label: null, price: 4, stock: null };
  const rules: Record<string, MoveClass> = {
    Entrée: 'in',
    Sortie: 'out',
    Inventaire: 'adjust',
    Transfert: 'ignore',
  };

  it('sorties en positif, retours en déduction, ajustements, lignes ignorées', () => {
    const rows = [
      ['06/01/2025', 'A', '100', 'Entrée', '2'],
      ['07/01/2025', 'A', '10', 'Sortie', '2'],
      ['07/01/2025', 'A', '5', 'Sortie', '2'],
      ['08/01/2025', 'A', '-3', 'Sortie', '2,5'], // retour client
      ['09/01/2025', 'A', '-2', 'Inventaire', ''],
      ['10/01/2025', 'A', '50', 'Transfert', ''],
    ];
    const r = buildDataset(rows, [2, 3, 4, 5, 6, 7], {
      mapping,
      dateOrder: 'dmy',
      decimal: ',',
      typeRules: rules,
    });
    if (!r.ok) throw new Error(r.error);
    const a = r.dataset.items[0]!;
    expect(a.consQty).toEqual([15, -3]);
    expect(a.moveNets).toEqual([100, -15, 3, -2]);
    expect(a.price).toBe(2.5); // dernier prix par date
    expect(r.report.rowsIgnored).toBe(1);
    expect(r.dataset.fileLastDay).toBe(dayFromYmd(2025, 1, 10));
  });

  it('sorties exportées en négatif : le signe majoritaire est aligné', () => {
    const rows = [
      ['06/01/2025', 'A', '-10', 'Sortie', ''],
      ['07/01/2025', 'A', '-4', 'Sortie', ''],
      ['08/01/2025', 'A', '2', 'Sortie', ''], // retour
    ];
    const r = buildDataset(rows, [2, 3, 4], {
      mapping,
      dateOrder: 'dmy',
      decimal: ',',
      typeRules: rules,
    });
    if (!r.ok) throw new Error(r.error);
    expect(r.dataset.items[0]!.consQty).toEqual([10, 4, -2]);
  });

  it('sans colonne type : négatif = sortie, positif = entrée', () => {
    const m2 = { ...mapping, type: null, price: null };
    const rows = [
      ['06/01/2025', 'A', '20', '', ''],
      ['07/01/2025', 'A', '-8', '', ''],
    ];
    const r = buildDataset(rows, [2, 3], {
      mapping: m2,
      dateOrder: 'dmy',
      decimal: ',',
      typeRules: null,
    });
    if (!r.ok) throw new Error(r.error);
    expect(r.dataset.items[0]!.consQty).toEqual([8]);
    expect(r.dataset.items[0]!.moveNets).toEqual([20, -8]);
    expect(r.dataset.hasPrice).toBe(false);
  });

  it('erreurs comptées avec la première ligne fautive, doublons détectés', () => {
    const rows = [
      ['31/02/2025', 'A', '1', 'Sortie', ''],
      ['01/02/2025', 'A', 'douze', 'Sortie', ''],
      ['01/02/2025', '', '1', 'Sortie', ''],
      ['30/02/2025', 'A', '1', 'Sortie', ''],
      ['03/02/2025', 'A', '1', 'Sortie', ''],
      ['03/02/2025', 'A', '1', 'Sortie', ''],
    ];
    const r = buildDataset(rows, [45, 46, 47, 48, 49, 50], {
      mapping,
      dateOrder: 'dmy',
      decimal: ',',
      typeRules: rules,
    });
    if (!r.ok) throw new Error(r.error);
    expect(r.report.invalidDate).toEqual({ count: 2, firstLine: 45, firstValue: '31/02/2025' });
    expect(r.report.invalidQty).toEqual({ count: 1, firstLine: 46, firstValue: 'douze' });
    expect(r.report.emptyItem?.count).toBe(1);
    expect(r.report.duplicateRows).toBe(1);
    expect(r.dataset.items[0]!.duplicates).toBe(1);
  });

  it('aucune ligne valide', () => {
    const r = buildDataset([['x', 'A', '1', 'Sortie', '']], [2], {
      mapping,
      dateOrder: 'dmy',
      decimal: ',',
      typeRules: rules,
    });
    expect(r.ok).toBe(false);
  });

  it('limite du nombre d’articles', () => {
    const rows = [
      ['01/01/2025', 'A', '1', 'Sortie', ''],
      ['01/01/2025', 'B', '1', 'Sortie', ''],
      ['01/01/2025', 'C', '1', 'Sortie', ''],
    ];
    const r = buildDataset(rows, [2, 3, 4], {
      mapping,
      dateOrder: 'dmy',
      decimal: ',',
      typeRules: rules,
      maxItems: 2,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('tooManyItems');
  });

  it('valeurs distinctes, échantillon, proposition de classement', () => {
    const rows = [['Sortie'], ['Sortie'], ['Entrée'], [' Sortie ']];
    expect(distinctValues(rows, 0).values).toEqual([
      { value: 'Sortie', count: 3 },
      { value: 'Entrée', count: 1 },
    ]);
    expect(sampleColumn(rows, 0, 2)).toHaveLength(2);
    expect(
      [
        'Entrée',
        'Réception',
        'Receipt',
        'Sortie',
        'Vente',
        'Issue',
        'Inventaire',
        'Adjustment',
        'Transfert',
      ].map(guessMoveClass),
    ).toEqual(['in', 'in', 'in', 'out', 'out', 'out', 'adjust', 'adjust', 'ignore']);
  });
});

describe('fichiers fournis', () => {
  const read = (p: string): string => decodeBytes(new Uint8Array(readFileSync(p))).text;

  it.each([
    ['public/modele-mouvements.csv', ';', 'dmy', ','],
    ['public/movements-template.csv', ',', 'ymd', '.'],
  ] as const)('modèle %s : lu et associé automatiquement', (path, delim, order, dec) => {
    const text = read(path);
    expect(detectDelimiter(text)).toBe(delim);
    const t = parseCsvText(text, delim);
    const m = autoMap(t.header);
    expect(missingRequired(m)).toEqual([]);
    expect(m.type).not.toBeNull();
    expect(m.price).not.toBeNull();
    expect(detectDateOrder(sampleColumn(t.rows, m.date)).order).toBe(order);
    expect(detectDecimalSeparator(sampleColumn(t.rows, m.price), delim)).toBe(dec);
  });
});
