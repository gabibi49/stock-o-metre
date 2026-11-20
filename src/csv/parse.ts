import Papa from 'papaparse';
import type { Delimiter } from './sniff';

/** Limites anti-blocage (voir DECISIONS.md). */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_ROWS = 2_000_000;
export const MAX_ITEMS = 50_000;
export const PREVIEW_ROWS = 20;

export interface ParsedTable {
  header: string[];
  rows: string[][];
  /** Numéro de ligne (1 = première ligne du fichier) de chaque ligne de données. */
  lines: number[];
  /** Ligne de l'en-tête. */
  headerLine: number;
  /** Avertissements de structure (guillemets non fermés…), 5 au plus. */
  warnings: { line: number; message: string }[];
}

export class TooManyRowsError extends Error {
  constructor() {
    super('tooManyRows');
  }
}

const isBlank = (row: readonly string[]): boolean => row.every((c) => c.trim() === '');

/**
 * Découpe le texte CSV avec Papa Parse, ligne par ligne, en conservant le
 * numéro de ligne d'origine de chaque enregistrement (pour des messages d'erreur
 * précis, y compris avec des champs multilignes entre guillemets).
 * La première ligne non vide est l'en-tête. Les lignes vides sont ignorées.
 */
export function parseCsvText(
  rawText: string,
  delimiter: Delimiter,
  onProgress?: (fraction: number) => void,
  maxRows = MAX_ROWS,
): ParsedTable {
  // Fins de ligne homogènes (CRLF, CR ou LF mélangés) : Papa Parse n'en détecte qu'une.
  const text = /\r/.test(rawText) ? rawText.replace(/\r\n?/g, '\n') : rawText;
  let header: string[] | null = null;
  let headerLine = 1;
  const rows: string[][] = [];
  const lines: number[] = [];
  const warnings: ParsedTable['warnings'] = [];
  let prevCursor = 0;
  let line = 1;
  let tooMany = false;
  let lastReport = 0;

  Papa.parse<string[]>(text, {
    delimiter,
    newline: '\n',
    skipEmptyLines: false,
    step: (res, parser) => {
      const cursor = res.meta.cursor;
      // Saute les fins de ligne qui précèdent l'enregistrement en les comptant.
      let start = prevCursor;
      while (start < cursor && (text[start] === '\n' || text[start] === '\r')) {
        if (text[start] === '\n') line++;
        start++;
      }
      const rowLine = line;
      for (
        let i = text.indexOf('\n', start);
        i !== -1 && i < cursor;
        i = text.indexOf('\n', i + 1)
      ) {
        line++;
      }
      prevCursor = cursor;

      const row = res.data;
      if (res.errors.length > 0 && warnings.length < 5) {
        warnings.push({ line: rowLine, message: res.errors[0]?.message ?? '' });
      }
      if (!Array.isArray(row) || isBlank(row)) return;
      if (header === null) {
        // trim() retire aussi un éventuel BOM résiduel en tête de la première cellule.
        header = row.map((h) => h.trim());
        headerLine = rowLine;
        return;
      }
      if (rows.length >= maxRows) {
        tooMany = true;
        parser.abort();
        return;
      }
      rows.push(row);
      lines.push(rowLine);
      if (onProgress && rows.length - lastReport >= 50_000) {
        lastReport = rows.length;
        onProgress(cursor / text.length);
      }
    },
  });
  if (tooMany) throw new TooManyRowsError();
  return { header: header ?? [], rows, lines, headerLine, warnings };
}
