import {
  analysisWindow,
  makePeriodIndexer,
  nextPeriodStart,
  type AnalysisWindow,
  type PeriodKind,
} from './periods';
import type { Dataset, ItemData } from './types';

export interface ItemDemand {
  /** Débuts des périodes retenues pour cet article. */
  starts: number[];
  /** Consommation par période (≥ 0), périodes sans sortie incluses (= 0). */
  demand: number[];
}

/**
 * Agrège la consommation d'un article par période.
 *
 * - Toutes les périodes complètes entre le premier mouvement de l'article et la fin
 *   du fichier sont présentes, y compris celles sans aucune sortie (consommation 0).
 *   Sans elles, une demande intermittente paraîtrait régulière.
 * - Les périodes incomplètes du fichier (début et fin) sont exclues (voir `analysisWindow`).
 * - Une période dont le cumul est négatif (plus de retours que de sorties) compte 0.
 */
export function aggregateItem(
  item: Pick<ItemData, 'firstDay' | 'consDays' | 'consQty'>,
  window: AnalysisWindow,
  indexer: (day: number) => number = makePeriodIndexer(window),
): ItemDemand {
  const { starts, kind } = window;
  let from = 0;
  while (from < starts.length && nextPeriodStart(starts[from] as number, kind) <= item.firstDay) {
    from++;
  }
  const itemStarts = starts.slice(from);
  const demand = new Array<number>(itemStarts.length).fill(0);
  for (let i = 0; i < item.consDays.length; i++) {
    const idx = indexer(item.consDays[i] as number) - from;
    if (idx >= 0 && idx < demand.length)
      demand[idx] = (demand[idx] as number) + (item.consQty[i] as number);
  }
  for (let i = 0; i < demand.length; i++) {
    const v = Math.round((demand[i] as number) * 1e9) / 1e9;
    demand[i] = v > 0 ? v : 0;
  }
  return { starts: itemStarts, demand };
}

export interface Aggregation {
  window: AnalysisWindow;
  items: ItemDemand[];
}

export function aggregateDataset(ds: Dataset, kind: PeriodKind): Aggregation {
  const window = analysisWindow(ds.fileFirstDay, ds.fileLastDay, kind);
  const indexer = makePeriodIndexer(window);
  return { window, items: ds.items.map((it) => aggregateItem(it, window, indexer)) };
}
