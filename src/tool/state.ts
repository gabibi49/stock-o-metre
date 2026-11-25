import type { BuildReport, MoveClass } from '../csv/build';
import type { DateOrder } from '../csv/dates';
import type { ColumnMapping } from '../csv/mapping';
import type { DecimalSeparator } from '../csv/numbers';
import { aggregateDataset, type Aggregation } from '../engine/aggregate';
import {
  computeAnalysis,
  DEFAULT_PARAMS,
  type AnalysisResult,
  type GlobalParams,
  type ItemOverrides,
} from '../engine/analyze';
import type { PeriodKind } from '../engine/periods';
import type { Dataset } from '../engine/types';
import type { InspectResult, LoadResult } from './protocol';

export type SortKey =
  | 'item'
  | 'status'
  | 'label'
  | 'abc'
  | 'xyz'
  | 'mu'
  | 'sigma'
  | 'cv'
  | 'ss'
  | 'rop'
  | 'target'
  | 'stock'
  | 'gap'
  | 'coverage'
  | 'alerts';

/** État de l'outil, en mémoire uniquement (rien n'est envoyé ni stocké, hors association des colonnes). */
export interface State {
  fileName: string;
  load: LoadResult | null;
  mapping: ColumnMapping | null;
  inspect: InspectResult | null;
  dateOrder: DateOrder;
  decimal: DecimalSeparator;
  typeRules: Record<string, MoveClass> | null;
  dataset: Dataset | null;
  report: BuildReport | null;
  aggCache: Map<PeriodKind, Aggregation>;
  params: GlobalParams;
  overrides: Map<number, ItemOverrides>;
  analysis: AnalysisResult | null;
  sortKey: SortKey;
  sortDir: 1 | -1;
  search: string;
  filterAbc: string;
  filterXyz: string;
  /** '' (tous), 'order', 'over', 'ok', 'unknown' ou 'check' (articles avec alerte). */
  filterStatus: string;
  showDetails: boolean;
  page: number;
  pageSize: number;
  selected: number | null;
  expanded: number | null;
}

export const state: State = {
  fileName: '',
  load: null,
  mapping: null,
  inspect: null,
  dateOrder: 'dmy',
  decimal: ',',
  typeRules: null,
  dataset: null,
  report: null,
  aggCache: new Map(),
  params: { ...DEFAULT_PARAMS, serviceLevels: { ...DEFAULT_PARAMS.serviceLevels } },
  overrides: new Map(),
  analysis: null,
  sortKey: 'item',
  sortDir: 1,
  search: '',
  filterAbc: '',
  filterXyz: '',
  filterStatus: '',
  showDetails: false,
  page: 0,
  pageSize: 50,
  selected: null,
  expanded: null,
};

export function resetAnalysis(): void {
  state.dataset = null;
  state.report = null;
  state.aggCache.clear();
  state.overrides.clear();
  state.analysis = null;
  state.selected = null;
  state.expanded = null;
  state.page = 0;
}

/** Recalcule tous les articles (rapide : l'agrégation est mise en cache par type de période). */
export function recompute(): AnalysisResult | null {
  const ds = state.dataset;
  if (!ds) return null;
  let agg = state.aggCache.get(state.params.kind);
  if (!agg) {
    agg = aggregateDataset(ds, state.params.kind);
    state.aggCache.set(state.params.kind, agg);
  }
  state.analysis = computeAnalysis(ds, agg, state.params, state.overrides);
  return state.analysis;
}
