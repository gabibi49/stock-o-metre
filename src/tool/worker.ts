/// <reference lib="webworker" />
/**
 * Web Worker : lecture et préparation du fichier, hors du fil principal pour ne
 * pas figer la page. Le fichier est lu localement (Blob.arrayBuffer) ; ce worker
 * n'effectue aucune requête réseau.
 */
import { buildDataset, distinctValues, sampleColumn } from '../csv/build';
import { detectDateOrder } from '../csv/dates';
import { decodeBytes } from '../csv/decode';
import { detectDecimalSeparator } from '../csv/numbers';
import { parseCsvText, PREVIEW_ROWS, TooManyRowsError, type ParsedTable } from '../csv/parse';
import { detectDelimiter, type Delimiter } from '../csv/sniff';
import type { InspectResult, LoadResult, WorkerRequest, WorkerResponse } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

let table: ParsedTable | null = null;
let delimiter: Delimiter = ';';

const post = (msg: WorkerResponse): void => self.postMessage(msg);

/** Date dont le jour ou le mois dépasse 12 : l'ordre jour/mois y est évident. */
const telling = (s: string): boolean => /(^|\D)(1[3-9]|2\d|3[01])\D/.test(s);

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  try {
    if (msg.type === 'load') {
      table = null;
      post({ id: msg.id, type: 'progress', phase: 'reading', fraction: 0 });
      const bytes = new Uint8Array(await msg.file.arrayBuffer());
      const { text, encoding } = decodeBytes(bytes);
      delimiter = detectDelimiter(text);
      post({ id: msg.id, type: 'progress', phase: 'parsing', fraction: 0.05 });
      const parsed = parseCsvText(text, delimiter, (f) =>
        post({ id: msg.id, type: 'progress', phase: 'parsing', fraction: 0.05 + f * 0.95 }),
      );
      if (parsed.header.length === 0 || parsed.rows.length === 0) {
        post({ id: msg.id, type: 'error', code: 'empty' });
        return;
      }
      table = parsed;
      const result: LoadResult = {
        encoding,
        delimiter,
        header: parsed.header,
        preview: parsed.rows.slice(0, PREVIEW_ROWS),
        rowCount: parsed.rows.length,
        warnings: parsed.warnings,
      };
      post({ id: msg.id, type: 'result', data: result });
      return;
    }
    if (!table) {
      post({ id: msg.id, type: 'error', code: 'noFile' });
      return;
    }
    if (msg.type === 'inspect') {
      const m = msg.mapping;
      const dateSamples = sampleColumn(table.rows, m.date);
      const numSamples = [
        ...sampleColumn(table.rows, m.qty),
        ...sampleColumn(table.rows, m.price),
        ...sampleColumn(table.rows, m.stock),
      ];
      const result: InspectResult = {
        date: detectDateOrder(dateSamples),
        // Exemples parlants d'abord : un jour > 12 lève l'ambiguïté visuelle (31/01 plutôt que 01/01).
        dateExamples: [...dateSamples]
          .sort((x, y) => Number(telling(y)) - Number(telling(x)))
          .slice(0, 3),
        decimal: detectDecimalSeparator(numSamples, delimiter),
        types: m.type === null ? null : distinctValues(table.rows, m.type),
      };
      post({ id: msg.id, type: 'result', data: result });
      return;
    }
    if (msg.type === 'build') {
      post({ id: msg.id, type: 'progress', phase: 'building', fraction: 0.5 });
      const result = buildDataset(table.rows, table.lines, msg.options);
      post({ id: msg.id, type: 'result', data: result });
    }
  } catch (err) {
    if (err instanceof TooManyRowsError) {
      post({ id: msg.id, type: 'error', code: 'tooManyRows' });
    } else {
      post({
        id: msg.id,
        type: 'error',
        code: 'unexpected',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }
};
