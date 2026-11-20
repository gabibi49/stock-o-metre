import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decodeBytes } from '../../src/csv/decode';
import { detectDelimiter } from '../../src/csv/sniff';
import { parseCsvText } from '../../src/csv/parse';
import { autoMap } from '../../src/csv/mapping';
import { detectDateOrder } from '../../src/csv/dates';
import { detectDecimalSeparator } from '../../src/csv/numbers';
import {
  buildDataset,
  distinctValues,
  guessMoveClass,
  sampleColumn,
  type MoveClass,
} from '../../src/csv/build';
import { aggregateDataset } from '../../src/engine/aggregate';
import { computeAnalysis, DEFAULT_PARAMS } from '../../src/engine/analyze';
import { replayStock } from '../../src/engine/replay';

/**
 * Test de bout en bout du moteur sur le jeu fictif (30 articles, 2 ans) :
 * tout le pipeline, sans navigateur.
 */
describe('jeu de données fictif complet', () => {
  const { text, encoding } = decodeBytes(
    new Uint8Array(readFileSync('tests/fixtures/demo-30-articles-2-ans.csv')),
  );
  const delimiter = detectDelimiter(text);
  const table = parseCsvText(text, delimiter);
  const mapping = autoMap(table.header);
  const types = distinctValues(table.rows, mapping.type as number).values;
  const rules = Object.fromEntries(types.map((t) => [t.value, guessMoveClass(t.value)])) as Record<
    string,
    MoveClass
  >;
  const decimal = detectDecimalSeparator(
    [...sampleColumn(table.rows, mapping.qty), ...sampleColumn(table.rows, mapping.price)],
    delimiter,
  );
  const built = buildDataset(table.rows, table.lines, {
    mapping,
    dateOrder: detectDateOrder(sampleColumn(table.rows, mapping.date)).order,
    decimal,
    typeRules: rules,
  });
  if (!built.ok) throw new Error(built.error);
  const ds = built.dataset;

  it('détections', () => {
    expect(encoding).toBe('utf-8-bom');
    expect(delimiter).toBe(';');
    expect(decimal).toBe(',');
    expect(mapping).toMatchObject({
      date: 0,
      item: 1,
      label: 2,
      qty: 3,
      type: 4,
      price: 5,
      stock: 6,
    });
    expect(rules).toEqual({ Vente: 'out', Réception: 'in', Inventaire: 'adjust' });
    expect(built.report.invalidDate).toBeNull();
    expect(built.report.invalidQty).toBeNull(); // y compris « 1 250 » (P30)
    expect(built.report.duplicateRows).toBe(2);
    expect(ds.items).toHaveLength(30);
  });

  const res = computeAnalysis(ds, aggregateDataset(ds, 'week'), DEFAULT_PARAMS);
  const byId = new Map(res.results.map((r) => [r.id, r]));

  it('semaine incomplète finale exclue (fichier arrêté un mercredi)', () => {
    expect(res.droppedLast).not.toBeNull();
    expect(res.droppedFirst).toBeNull(); // commence un lundi
    expect(res.periodCount).toBe(104);
  });

  it('stock reconstitué cohérent avec la simulation : jamais négatif', () => {
    for (const r of res.results) {
      if (r.currentStock !== null) expect(r.alerts).not.toContain('negativeStock');
    }
  });

  it('les articles intermittents sont signalés', () => {
    for (const id of ['P21', 'P22', 'P23', 'P24', 'P25']) {
      expect(byId.get(id)!.alerts).toContain('intermittent');
      expect(byId.get(id)!.xyz).toBe('Z');
    }
  });

  it('ruptures présentes sur les articles sous-dimensionnés', () => {
    for (const id of ['P26', 'P27']) {
      const item = ds.items.find((i) => i.id === id)!;
      const s = replayStock(
        item.moveDays,
        item.moveNets,
        item.stockFromFile,
        ds.fileFirstDay,
        ds.fileLastDay,
      );
      expect(s.stock.some((v) => v <= 0)).toBe(true);
    }
  });

  it('historique court pour l’article lancé en juin 2025, doublons pour P05', () => {
    expect(byId.get('P28')!.n).toBeLessThan(104);
    expect(byId.get('P05')!.alerts).toContain('duplicates');
  });

  it('articles sans stock actuel : pas de couverture ni d’écart', () => {
    expect(byId.get('P11')!.currentStock).toBeNull();
    expect(byId.get('P11')!.gap).toBeNull();
  });

  it('ABC sur la valeur : les trois classes existent, les A pèsent ~80 %', () => {
    expect(res.abcBasis).toBe('value');
    const classes = new Set(res.results.map((r) => r.abc));
    expect(classes).toEqual(new Set(['A', 'B', 'C']));
    const total = res.results.reduce((s, r) => s + r.abcValue, 0);
    const a = res.results.filter((r) => r.abc === 'A').reduce((s, r) => s + r.abcValue, 0);
    expect(a / total).toBeGreaterThanOrEqual(0.8);
  });

  it('agrégation mensuelle : 24 mois complets', () => {
    const m = computeAnalysis(ds, aggregateDataset(ds, 'month'), {
      ...DEFAULT_PARAMS,
      kind: 'month',
    });
    expect(m.periodCount).toBe(24);
    expect(m.droppedLast).toBeNull();
  });
});
