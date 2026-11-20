/**
 * Écriture CSV sûre pour l'export des résultats.
 *
 * Protection contre l'injection de formules (CSV injection) : toute cellule de
 * texte commençant par =, +, -, @, une tabulation ou un retour chariot est
 * préfixée d'une apostrophe, pour qu'un tableur ne l'interprète jamais comme une
 * formule. Les cellules numériques produites par l'outil (type number) ne sont
 * pas préfixées : ce sont des nombres validés, et « -12 » doit rester un nombre
 * exploitable dans le tableur (voir DECISIONS.md).
 */

/** Marque d'ordre des octets UTF-8 (U+FEFF), écrite par son code pour rester visible dans le source. */
const BOM = String.fromCharCode(0xfeff);
const CRLF = String.fromCharCode(13, 10);

const DANGEROUS_START = /^[=+\-@\t\r]/;

export type Cell = string | number | null;

export function sanitizeText(value: string): string {
  return DANGEROUS_START.test(value) ? `'${value}` : value;
}

export interface CsvOptions {
  delimiter: ';' | ',';
  decimal: ',' | '.';
}

function formatNumber(n: number, decimal: ',' | '.'): string {
  if (!Number.isFinite(n)) return '';
  // Pas de séparateur de milliers : relecture fiable par les tableurs.
  const s = String(Math.round(n * 1e6) / 1e6);
  return decimal === ',' ? s.replace('.', ',') : s;
}

export function csvCell(value: Cell, opts: CsvOptions): string {
  if (value === null) return '';
  const raw = typeof value === 'number' ? formatNumber(value, opts.decimal) : sanitizeText(value);
  return /["\n\r]/.test(raw) || raw.includes(opts.delimiter) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

/** CSV complet avec BOM UTF-8 (ouverture correcte des accents dans Excel). */
export function toCsv(rows: readonly (readonly Cell[])[], opts: CsvOptions): string {
  const body = rows.map((r) => r.map((c) => csvCell(c, opts)).join(opts.delimiter)).join(CRLF);
  return `${BOM}${body}${CRLF}`;
}
