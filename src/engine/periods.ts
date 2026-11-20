import { dayFromYmd, isoWeek, isoWeekday, ymdFromDay } from './dates';

export type PeriodKind = 'week' | 'month';

/**
 * Nombre de jours par période, pour convertir délai et période de revue (en jours)
 * en nombre de périodes. 30,4375 = 365,25 / 12 (mois moyen, années bissextiles comprises).
 */
export const DAYS_PER_PERIOD: Readonly<Record<PeriodKind, number>> = {
  week: 7,
  month: 30.4375,
};

/** Premier jour de la période (lundi de la semaine ISO, ou 1er du mois). */
export function periodStart(day: number, kind: PeriodKind): number {
  if (kind === 'week') return day - isoWeekday(day) + 1;
  const { y, m } = ymdFromDay(day);
  return dayFromYmd(y, m, 1);
}

/** Premier jour de la période suivante. */
export function nextPeriodStart(start: number, kind: PeriodKind): number {
  if (kind === 'week') return periodStart(start, 'week') + 7;
  const { y, m } = ymdFromDay(start);
  return m === 12 ? dayFromYmd(y + 1, 1, 1) : dayFromYmd(y, m + 1, 1);
}

/** Dernier jour (inclus) de la période qui commence à `start`. */
export function periodEnd(start: number, kind: PeriodKind): number {
  return nextPeriodStart(start, kind) - 1;
}

/** Libellé lisible : « 2025-S03 » / « 2025-W03 » pour une semaine ISO, « 2025-03 » pour un mois. */
export function periodLabel(start: number, kind: PeriodKind, weekPrefix = 'W'): string {
  if (kind === 'week') {
    const { year, week } = isoWeek(start);
    return `${year}-${weekPrefix}${String(week).padStart(2, '0')}`;
  }
  const { y, m } = ymdFromDay(start);
  return `${y}-${String(m).padStart(2, '0')}`;
}

export interface AnalysisWindow {
  kind: PeriodKind;
  /** Débuts des périodes complètes retenues pour l'analyse, dans l'ordre. */
  starts: number[];
  /** Début de la première période, exclue car incomplète (sinon null). */
  droppedFirst: number | null;
  /** Début de la dernière période, exclue car incomplète (sinon null). */
  droppedLast: number | null;
}

/**
 * Périodes complètes couvertes par le fichier, entre sa première et sa dernière date.
 *
 * Une période n'est retenue que si le fichier la couvre entièrement. La dernière
 * période (période « en cours ») est exclue si le fichier s'arrête avant sa fin ;
 * la première est exclue si le fichier commence après son début. Les deux cas sont
 * signalés, car une période partielle sous-estimerait la consommation.
 */
export function analysisWindow(
  firstDay: number,
  lastDay: number,
  kind: PeriodKind,
): AnalysisWindow {
  if (lastDay < firstDay) throw new RangeError('analysisWindow: lastDay < firstDay');
  const firstStart = periodStart(firstDay, kind);
  const lastStart = periodStart(lastDay, kind);
  const droppedFirst = firstStart < firstDay ? firstStart : null;
  const droppedLast = periodEnd(lastStart, kind) > lastDay ? lastStart : null;
  const starts: number[] = [];
  for (let s = firstStart; s <= lastStart; s = nextPeriodStart(s, kind)) {
    if (s === droppedFirst || s === droppedLast) continue;
    starts.push(s);
  }
  return { kind, starts, droppedFirst, droppedLast };
}

/**
 * Index rapide « jour → index de période dans la fenêtre ». Renvoie -1 si le jour
 * tombe hors des périodes retenues (période incomplète exclue, ou hors fichier).
 */
export function makePeriodIndexer(window: AnalysisWindow): (day: number) => number {
  const index = new Map<number, number>();
  window.starts.forEach((s, i) => index.set(s, i));
  return (day: number) => index.get(periodStart(day, window.kind)) ?? -1;
}
