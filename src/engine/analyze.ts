import {
  classifyAbc,
  classifyXyz,
  DEFAULT_ABC,
  DEFAULT_XYZ,
  type AbcClass,
  type AbcEntry,
  type AbcThresholds,
  type XyzClass,
  type XyzThresholds,
} from './abcxyz';
import type { Aggregation } from './aggregate';
import type { PeriodKind } from './periods';
import { replayStock } from './replay';
import { computePolicy, coverageInDays, type PolicyResult, type SafetyMethod } from './safety';
import { coefficientOfVariation, mean, sampleStdDev, sum, zeroShare } from './stats';
import type { Dataset } from './types';

/** Seuil d'historique court : moins de 8 périodes. */
export const MIN_HISTORY_PERIODS = 8;
/** Demande intermittente : plus de 30 % de périodes à zéro. */
export const INTERMITTENT_ZERO_SHARE = 0.3;

export interface GlobalParams {
  kind: PeriodKind;
  leadTimeDays: number;
  reviewDays: number;
  leadTimeSdDays: number;
  method: SafetyMethod;
  coverageDays: number;
  serviceLevels: Record<AbcClass, number>;
  abc: AbcThresholds;
  xyz: XyzThresholds;
}

export const DEFAULT_PARAMS: GlobalParams = {
  kind: 'week',
  leadTimeDays: 14,
  reviewDays: 7,
  leadTimeSdDays: 0,
  method: 'demand',
  coverageDays: 10,
  serviceLevels: { A: 0.98, B: 0.95, C: 0.9 },
  abc: DEFAULT_ABC,
  xyz: DEFAULT_XYZ,
};

/** Paramètres modifiés article par article (les autres viennent des valeurs globales). */
export interface ItemOverrides {
  leadTimeDays?: number;
  reviewDays?: number;
  leadTimeSdDays?: number;
  serviceLevel?: number;
  method?: SafetyMethod;
  coverageDays?: number;
  currentStock?: number | null;
}

export type AlertCode =
  'shortHistory' | 'intermittent' | 'negativeStock' | 'zeroDemand' | 'duplicates' | 'noPrice';

export interface EffectiveParams {
  leadTimeDays: number;
  reviewDays: number;
  leadTimeSdDays: number;
  serviceLevel: number;
  method: SafetyMethod;
  coverageDays: number;
}

export interface ItemResult {
  index: number;
  id: string;
  label: string;
  periodStarts: number[];
  demand: number[];
  n: number;
  mu: number;
  sigma: number;
  cv: number | null;
  zeroShare: number;
  consumption: number;
  price: number | null;
  /** Valeur consommée (quantité × prix) ou quantité si pas de prix. */
  abcValue: number;
  abc: AbcClass;
  xyz: XyzClass | null;
  params: EffectiveParams;
  overridden: (keyof ItemOverrides)[];
  policy: PolicyResult;
  currentStock: number | null;
  /** Stock actuel − stock cible (arrondi). > 0 : surstock, < 0 : sous-stock. */
  gap: number | null;
  gapValue: number | null;
  coverageDays: number | null;
  stockMin: number | null;
  duplicates: number;
  alerts: AlertCode[];
}

export interface AnalysisResult {
  kind: PeriodKind;
  abcBasis: 'value' | 'quantity';
  results: ItemResult[];
  /** Entrées ABC triées par valeur décroissante (courbe de Pareto). */
  pareto: AbcEntry[];
  droppedFirst: number | null;
  droppedLast: number | null;
  periodCount: number;
}

export function computeAnalysis(
  ds: Dataset,
  agg: Aggregation,
  params: GlobalParams,
  overrides: ReadonlyMap<number, ItemOverrides> = new Map(),
): AnalysisResult {
  const abcBasis = ds.hasPrice ? 'value' : 'quantity';
  const base = ds.items.map((item, i) => {
    const d = agg.items[i]?.demand ?? [];
    const mu = mean(d);
    const sigma = sampleStdDev(d);
    const consumption = sum(d);
    const abcValue = abcBasis === 'value' ? consumption * (item.price ?? 0) : consumption;
    return { item, d, mu, sigma, consumption, abcValue };
  });
  const pareto = classifyAbc(
    base.map((b) => b.abcValue),
    params.abc,
  );
  const abcByIndex: AbcClass[] = new Array<AbcClass>(base.length);
  for (const e of pareto) abcByIndex[e.index] = e.abc;

  const results = base.map(({ item, d, mu, sigma, consumption, abcValue }, i): ItemResult => {
    const ov = overrides.get(i) ?? {};
    const abc = abcByIndex[i] ?? 'C';
    const cv = coefficientOfVariation(mu, sigma);
    const eff: EffectiveParams = {
      leadTimeDays: ov.leadTimeDays ?? params.leadTimeDays,
      reviewDays: ov.reviewDays ?? params.reviewDays,
      leadTimeSdDays: ov.leadTimeSdDays ?? params.leadTimeSdDays,
      serviceLevel: ov.serviceLevel ?? params.serviceLevels[abc],
      method: ov.method ?? params.method,
      coverageDays: ov.coverageDays ?? params.coverageDays,
    };
    const policy = computePolicy({ kind: params.kind, mu, sigma, ...eff });
    const currentStock =
      ov.currentStock !== undefined ? ov.currentStock : (item.stockFromFile ?? null);
    const gap = currentStock === null ? null : currentStock - policy.targetRounded;
    const gapValue = gap === null || item.price === null ? null : gap * item.price;
    const coverageDays =
      currentStock === null ? null : coverageInDays(currentStock, policy.muPerDay);

    let stockMin: number | null = null;
    if (currentStock !== null) {
      stockMin = replayStock(
        item.moveDays,
        item.moveNets,
        currentStock,
        ds.fileFirstDay,
        ds.fileLastDay,
      ).min;
    }

    const alerts: AlertCode[] = [];
    if (d.length < MIN_HISTORY_PERIODS) alerts.push('shortHistory');
    if (mu === 0) alerts.push('zeroDemand');
    else if (zeroShare(d) > INTERMITTENT_ZERO_SHARE) alerts.push('intermittent');
    if (stockMin !== null && stockMin < -1e-9) alerts.push('negativeStock');
    if (item.duplicates > 0) alerts.push('duplicates');
    if (ds.hasPrice && item.price === null) alerts.push('noPrice');

    return {
      index: i,
      id: item.id,
      label: item.label,
      periodStarts: agg.items[i]?.starts ?? [],
      demand: d,
      n: d.length,
      mu,
      sigma,
      cv,
      zeroShare: zeroShare(d),
      consumption,
      price: item.price,
      abcValue,
      abc,
      xyz: classifyXyz(cv, params.xyz),
      params: eff,
      overridden: (Object.keys(ov) as (keyof ItemOverrides)[]).filter((k) => ov[k] !== undefined),
      policy,
      currentStock,
      gap,
      gapValue,
      coverageDays,
      stockMin,
      duplicates: item.duplicates,
      alerts,
    };
  });

  return {
    kind: params.kind,
    abcBasis,
    results,
    pareto,
    droppedFirst: agg.window.droppedFirst,
    droppedLast: agg.window.droppedLast,
    periodCount: agg.window.starts.length,
  };
}
