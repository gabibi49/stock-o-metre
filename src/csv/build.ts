import type { Dataset, ItemData } from '../engine/types';
import { parseDate, type DateOrder } from './dates';
import type { ColumnMapping } from './mapping';
import { parseNumber, type DecimalSeparator } from './numbers';
import { MAX_ITEMS } from './parse';

/**
 * Classement d'un type de mouvement :
 * - `in` : entrée (réception…) ; `out` : sortie = consommation ;
 * - `adjust` : ajustement (inventaire…) : modifie le stock reconstitué mais n'est
 *   pas une consommation ;
 * - `ignore` : ligne ignorée (ni consommation ni stock).
 */
export type MoveClass = 'in' | 'out' | 'adjust' | 'ignore';

export interface BuildOptions {
  mapping: ColumnMapping;
  dateOrder: DateOrder;
  decimal: DecimalSeparator;
  /** Classement des valeurs de la colonne type (clé = valeur sans espaces autour). */
  typeRules: Readonly<Record<string, MoveClass>> | null;
  maxItems?: number;
}

export interface ColumnIssue {
  count: number;
  firstLine: number;
  firstValue: string;
}

export interface BuildReport {
  rowsRead: number;
  rowsUsed: number;
  rowsIgnored: number;
  invalidDate: ColumnIssue | null;
  invalidQty: ColumnIssue | null;
  emptyItem: ColumnIssue | null;
  invalidPrice: ColumnIssue | null;
  invalidStock: ColumnIssue | null;
  duplicateRows: number;
  itemCount: number;
}

export type BuildResult =
  | { ok: true; dataset: Dataset; report: BuildReport }
  | { ok: false; error: 'noValidRows' | 'tooManyItems'; report: BuildReport };

/** Hachage 53 bits (cyrb53) : détecte les lignes identiques sans garder leur texte en mémoire. */
function hash53(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function track(issue: ColumnIssue | null, line: number, value: string): ColumnIssue {
  if (issue) {
    issue.count++;
    return issue;
  }
  return {
    count: 1,
    firstLine: line,
    firstValue: value.length > 60 ? `${value.slice(0, 57)}…` : value,
  };
}

interface ItemAcc {
  id: string;
  label: string;
  labelDay: number;
  price: number | null;
  priceDay: number;
  stock: number | null;
  stockDay: number;
  firstDay: number;
  cons: Map<number, number>;
  nets: Map<number, number>;
  duplicates: number;
  lines: number;
}

const sortedArrays = (m: Map<number, number>): [number[], number[]] => {
  const days = [...m.keys()].sort((a, b) => a - b);
  return [days, days.map((d) => Math.round((m.get(d) as number) * 1e9) / 1e9)];
};

/**
 * Transforme les lignes du CSV en données par article.
 *
 * Signe des quantités : certains logiciels exportent les sorties en négatif,
 * d'autres en positif. Pour chaque type de mouvement classé « entrée » ou
 * « sortie », on regarde le signe majoritaire de ses quantités et on l'aligne :
 * une sortie compte toujours comme une consommation positive, et une ligne de
 * signe contraire à la majorité (retour) vient en déduction.
 * Sans colonne type : quantité négative = sortie, positive = entrée.
 */
export function buildDataset(
  rows: readonly string[][],
  lines: readonly number[],
  opts: BuildOptions,
): BuildResult {
  const { mapping: m, dateOrder, decimal, typeRules } = opts;
  const maxItems = opts.maxItems ?? MAX_ITEMS;
  const report: BuildReport = {
    rowsRead: rows.length,
    rowsUsed: 0,
    rowsIgnored: 0,
    invalidDate: null,
    invalidQty: null,
    emptyItem: null,
    invalidPrice: null,
    invalidStock: null,
    duplicateRows: 0,
    itemCount: 0,
  };
  const cell = (row: readonly string[], col: number | null): string =>
    col === null ? '' : (row[col] ?? '').trim();

  // 1er passage : lecture, validation, doublons, signe majoritaire par type.
  const n = rows.length;
  const pDay = new Int32Array(n);
  const pQty = new Float64Array(n);
  const pClass = new Int8Array(n); // 0 ignorée/invalide, 1 entrée, 2 sortie, 3 ajustement
  const pType: string[] = new Array<string>(n);
  const pDup = new Uint8Array(n);
  const signVotes = new Map<string, number>();
  const seen = new Set<number>();
  let fileFirst = Infinity;
  let fileLast = -Infinity;

  for (let i = 0; i < n; i++) {
    const row = rows[i] as string[];
    const line = lines[i] ?? i + 2;
    const rawDate = cell(row, m.date);
    const day = parseDate(rawDate, dateOrder);
    if (day === null) {
      report.invalidDate = track(report.invalidDate, line, rawDate);
      continue;
    }
    const item = cell(row, m.item);
    if (item === '') {
      report.emptyItem = track(report.emptyItem, line, '');
      continue;
    }
    const rawQty = cell(row, m.qty);
    const qty = parseNumber(rawQty, decimal);
    if (qty === null) {
      report.invalidQty = track(report.invalidQty, line, rawQty);
      continue;
    }
    if (day < fileFirst) fileFirst = day;
    if (day > fileLast) fileLast = day;

    let cls: MoveClass;
    const typeValue = m.type === null ? '' : cell(row, m.type);
    if (m.type === null || typeRules === null) {
      cls = qty < 0 ? 'out' : qty > 0 ? 'in' : 'ignore';
    } else {
      cls = typeRules[typeValue] ?? 'ignore';
    }
    if (cls === 'ignore') {
      report.rowsIgnored++;
      continue;
    }
    pDay[i] = day;
    pQty[i] = qty;
    pClass[i] = cls === 'in' ? 1 : cls === 'out' ? 2 : 3;
    pType[i] = typeValue;
    if (m.type !== null && typeRules !== null && cls !== 'adjust' && qty !== 0) {
      signVotes.set(typeValue, (signVotes.get(typeValue) ?? 0) + (qty > 0 ? 1 : -1));
    }
    const h = hash53(row.join('\u0001'));
    if (seen.has(h)) {
      pDup[i] = 1;
      report.duplicateRows++;
    } else seen.add(h);
  }

  // 2e passage : accumulation par article et par jour.
  const items = new Map<string, ItemAcc>();
  for (let i = 0; i < n; i++) {
    const c = pClass[i] as number;
    if (c === 0) continue;
    const row = rows[i] as string[];
    const line = lines[i] ?? i + 2;
    const id = cell(row, m.item);
    let acc = items.get(id);
    if (!acc) {
      if (items.size >= maxItems) {
        return {
          ok: false,
          error: 'tooManyItems',
          report: { ...report, itemCount: items.size + 1 },
        };
      }
      acc = {
        id,
        label: '',
        labelDay: -Infinity,
        price: null,
        priceDay: -Infinity,
        stock: null,
        stockDay: -Infinity,
        firstDay: Infinity,
        cons: new Map(),
        nets: new Map(),
        duplicates: 0,
        lines: 0,
      };
      items.set(id, acc);
    }
    const day = pDay[i] as number;
    const raw = pQty[i] as number;
    acc.lines++;
    report.rowsUsed++;
    if (pDup[i]) acc.duplicates++;
    if (day < acc.firstDay) acc.firstDay = day;

    const typeValue = pType[i] as string;
    const sign =
      m.type !== null && typeRules !== null ? ((signVotes.get(typeValue) ?? 1) >= 0 ? 1 : -1) : 1;
    let net: number;
    if (c === 2) {
      // Sortie : consommation positive.
      const consumption = m.type !== null && typeRules !== null ? raw * sign : -raw;
      acc.cons.set(day, (acc.cons.get(day) ?? 0) + consumption);
      net = -consumption;
    } else if (c === 1) {
      net = m.type !== null && typeRules !== null ? raw * sign : raw;
    } else {
      net = raw; // ajustement : signé tel quel
    }
    acc.nets.set(day, (acc.nets.get(day) ?? 0) + net);

    const label = cell(row, m.label);
    if (label !== '' && day >= acc.labelDay) {
      acc.label = label;
      acc.labelDay = day;
    }
    if (m.price !== null) {
      const rawPrice = cell(row, m.price);
      if (rawPrice !== '') {
        const p = parseNumber(rawPrice, decimal);
        if (p === null || p < 0) report.invalidPrice = track(report.invalidPrice, line, rawPrice);
        else if (day >= acc.priceDay && p > 0) {
          acc.price = p;
          acc.priceDay = day;
        }
      }
    }
    if (m.stock !== null) {
      const rawStock = cell(row, m.stock);
      if (rawStock !== '') {
        const s = parseNumber(rawStock, decimal);
        if (s === null) report.invalidStock = track(report.invalidStock, line, rawStock);
        else if (day >= acc.stockDay) {
          acc.stock = s;
          acc.stockDay = day;
        }
      }
    }
  }

  report.itemCount = items.size;
  if (items.size === 0 || !Number.isFinite(fileFirst)) {
    return { ok: false, error: 'noValidRows', report };
  }
  const out: ItemData[] = [];
  for (const acc of items.values()) {
    const [consDays, consQty] = sortedArrays(acc.cons);
    const [moveDays, moveNets] = sortedArrays(acc.nets);
    out.push({
      id: acc.id,
      label: acc.label,
      price: acc.price,
      stockFromFile: acc.stock,
      firstDay: acc.firstDay,
      consDays,
      consQty,
      moveDays,
      moveNets,
      duplicates: acc.duplicates,
      lines: acc.lines,
    });
  }
  return {
    ok: true,
    dataset: {
      items: out,
      fileFirstDay: fileFirst,
      fileLastDay: fileLast,
      hasPrice: m.price !== null,
    },
    report,
  };
}

/** Valeurs distinctes d'une colonne avec leur nombre d'occurrences (les plus fréquentes d'abord). */
export function distinctValues(
  rows: readonly string[][],
  col: number,
  limit = 200,
): { values: { value: string; count: number }[]; total: number } {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const v = (row[col] ?? '').trim();
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  const values = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  return { values: values.slice(0, limit), total: values.length };
}

/** Échantillon de valeurs non vides d'une colonne (pour la détection des formats). */
export function sampleColumn(rows: readonly string[][], col: number | null, size = 500): string[] {
  if (col === null) return [];
  const out: string[] = [];
  const step = Math.max(1, Math.floor(rows.length / size));
  for (let i = 0; i < rows.length && out.length < size; i += step) {
    const v = (rows[i]?.[col] ?? '').trim();
    if (v !== '') out.push(v);
  }
  return out;
}

/** Proposition de classement des types de mouvement d'après leur libellé (FR/EN). */
export function guessMoveClass(value: string): MoveClass {
  const v = value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (/(inventaire|ajust|regul|inventory|adjust|correction|count)/.test(v)) return 'adjust';
  if (
    /(sortie|vente|conso|expedi|livraison client|^s$|out|issue|sale|ship|consum|picking|prelev)/.test(
      v,
    )
  )
    return 'out';
  if (/(entree|recep|achat|^e$|in$|^in|receipt|purchase|receiv|production)/.test(v)) return 'in';
  return 'ignore';
}
