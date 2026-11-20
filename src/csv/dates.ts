import { dayFromYmd, isValidYmd } from '../engine/dates';

/** Ordre des composantes : jour/mois/année, mois/jour/année, année-mois-jour. */
export type DateOrder = 'dmy' | 'mdy' | 'ymd';

/**
 * jj/mm/aaaa, jj.mm.aaaa, jj-mm-aaaa, aaaa-mm-jj, aaaa/mm/jj, avec ou sans heure
 * (« 14:30 », « 14:30:00 », « T14:30:00.000Z », fuseau éventuel ignoré : seule la
 * date calendaire compte). Année sur 2 chiffres acceptée en dernière position (→ 20aa).
 */
const DATE_RE =
  /^(\d{1,4})[/.-](\d{1,2})[/.-](\d{1,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:[.,]\d+)?)?(?:\s*(?:Z|[+-]\d{2}:?\d{2}))?)?$/;

interface DateParts {
  a: number;
  b: number;
  c: number;
  aLen: number;
  cLen: number;
}

function split(raw: string): DateParts | null {
  const m = DATE_RE.exec(raw.trim());
  if (!m) return null;
  const [, a, b, c, hh, mm, ss] = m;
  if (
    hh !== undefined &&
    (Number(hh) > 23 || Number(mm) > 59 || (ss !== undefined && Number(ss) > 59))
  ) {
    return null;
  }
  return {
    a: Number(a),
    b: Number(b),
    c: Number(c),
    aLen: (a as string).length,
    cLen: (c as string).length,
  };
}

function expandYear(y: number, len: number): number | null {
  if (len === 4) return y;
  if (len === 2) return 2000 + y;
  return null;
}

/** Convertit une date texte en numéro de jour, ou null si illisible ou inexistante (31/02). */
export function parseDate(raw: string, order: DateOrder): number | null {
  const p = split(raw);
  if (!p) return null;
  let y: number | null;
  let m: number;
  let d: number;
  if (p.aLen === 4) {
    // L'année en tête impose l'ordre année-mois-jour, quel que soit le réglage.
    y = p.a;
    m = p.b;
    d = p.c;
    if (p.cLen > 2) return null;
  } else {
    if (order === 'ymd') return null;
    y = expandYear(p.c, p.cLen);
    if (order === 'dmy') {
      d = p.a;
      m = p.b;
    } else {
      m = p.a;
      d = p.b;
    }
  }
  if (y === null || !isValidYmd(y, m, d)) return null;
  return dayFromYmd(y, m, d);
}

export interface DateDetection {
  order: DateOrder;
  /** true si l'échantillon ne permet pas de trancher entre jj/mm et mm/jj. */
  ambiguous: boolean;
}

/**
 * Devine l'ordre des dates à partir d'un échantillon.
 * - Toutes les dates en aaaa-mm-jj → ymd.
 * - Un premier nombre > 12 → jour en premier (dmy) ; un second nombre > 12 → mdy.
 * - Si rien ne permet de trancher (toutes les valeurs ≤ 12), c'est ambigu :
 *   l'interface demande alors au visiteur (proposition par défaut : jj/mm).
 */
export function detectDateOrder(samples: readonly string[]): DateDetection {
  let dmy = 0;
  let mdy = 0;
  let ymd = 0;
  let dm = 0;
  for (const s of samples) {
    const p = split(s);
    if (!p) continue;
    if (p.aLen === 4) {
      ymd++;
      continue;
    }
    dm++;
    if (p.a > 12 && p.b <= 12) dmy++;
    else if (p.b > 12 && p.a <= 12) mdy++;
  }
  if (dm === 0) return { order: 'ymd', ambiguous: ymd === 0 };
  if (dmy > 0 && mdy === 0) return { order: 'dmy', ambiguous: false };
  if (mdy > 0 && dmy === 0) return { order: 'mdy', ambiguous: false };
  if (dmy > 0 && mdy > 0) return { order: dmy >= mdy ? 'dmy' : 'mdy', ambiguous: true };
  return { order: 'dmy', ambiguous: true };
}
