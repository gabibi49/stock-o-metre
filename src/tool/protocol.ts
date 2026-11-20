import type { BuildOptions, BuildReport } from '../csv/build';
import type { DateDetection } from '../csv/dates';
import type { DetectedEncoding } from '../csv/decode';
import type { ColumnMapping } from '../csv/mapping';
import type { DecimalSeparator } from '../csv/numbers';
import type { Delimiter } from '../csv/sniff';
import type { Dataset } from '../engine/types';

/** Messages échangés entre la page et le Web Worker (aucun réseau : postMessage local). */
export type WorkerRequest =
  | { id: number; type: 'load'; file: Blob }
  | { id: number; type: 'inspect'; mapping: ColumnMapping }
  | { id: number; type: 'build'; options: BuildOptions };

export interface LoadResult {
  encoding: DetectedEncoding;
  delimiter: Delimiter;
  header: string[];
  preview: string[][];
  rowCount: number;
  warnings: { line: number; message: string }[];
}

export interface InspectResult {
  date: DateDetection;
  dateExamples: string[];
  decimal: DecimalSeparator;
  types: { values: { value: string; count: number }[]; total: number } | null;
}

export type BuildResponse =
  | { ok: true; dataset: Dataset; report: BuildReport }
  | { ok: false; error: 'noValidRows' | 'tooManyItems'; report: BuildReport };

export type WorkerErrorCode = 'empty' | 'tooManyRows' | 'noFile' | 'unexpected';

export type WorkerResponse =
  | { id: number; type: 'progress'; phase: 'reading' | 'parsing' | 'building'; fraction: number }
  | { id: number; type: 'result'; data: LoadResult | InspectResult | BuildResponse }
  | { id: number; type: 'error'; code: WorkerErrorCode; detail?: string };
