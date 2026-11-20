/**
 * Reconstitution du stock dans le temps à partir des mouvements.
 *
 * - Avec un stock actuel connu (stock à la fin du fichier) : on remonte le temps en
 *   annulant les mouvements. Stock fin du jour j = stock actuel − Σ(mouvements nets après j).
 * - Sans stock actuel : on part de 0 au début du fichier et on cumule les mouvements.
 *   La courbe est alors relative (seules les variations ont un sens).
 */

export interface StockSeries {
  /** Jours (numéros de jour) des points, croissants. Le premier point est le début du fichier. */
  days: number[];
  /** Stock en fin de journée correspondant (le premier point = stock d'ouverture). */
  stock: number[];
  absolute: boolean;
  min: number;
  /** Stock d'ouverture, avant le premier mouvement du fichier. */
  opening: number;
  closing: number;
}

/**
 * @param days jours des mouvements, strictement croissants (mouvements déjà cumulés par jour)
 * @param nets mouvement net du jour (entrées − sorties ± ajustements)
 * @param currentStock stock à la fin du fichier, ou null s'il est inconnu
 * @param fileFirstDay première date du fichier
 * @param fileLastDay dernière date du fichier
 */
export function replayStock(
  days: readonly number[],
  nets: readonly number[],
  currentStock: number | null,
  fileFirstDay: number,
  fileLastDay: number,
): StockSeries {
  if (days.length !== nets.length) throw new RangeError('replayStock: tailles différentes');
  let totalNet = 0;
  for (const n of nets) totalNet += n;
  const absolute = currentStock !== null && Number.isFinite(currentStock);
  const opening = absolute ? (currentStock as number) - totalNet : 0;

  const outDays: number[] = [];
  const outStock: number[] = [];
  let level = opening;
  // Point d'ouverture : la veille du premier jour du fichier si un mouvement a lieu ce jour-là.
  const openDay = days.length > 0 && days[0] === fileFirstDay ? fileFirstDay - 1 : fileFirstDay;
  outDays.push(openDay);
  outStock.push(level);
  let min = level;
  for (let i = 0; i < days.length; i++) {
    level += nets[i] as number;
    // Évite l'accumulation d'erreurs binaires (ex. 0,1 + 0,2).
    level = Math.round(level * 1e9) / 1e9;
    outDays.push(days[i] as number);
    outStock.push(level);
    if (level < min) min = level;
  }
  const last = outDays[outDays.length - 1] as number;
  if (fileLastDay > last) {
    outDays.push(fileLastDay);
    outStock.push(level);
  }
  return { days: outDays, stock: outStock, absolute, min, opening, closing: level };
}

/** Intervalles [début, fin] (jours) pendant lesquels le stock est ≤ 0. */
export function stockoutIntervals(series: StockSeries): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let start: number | null = null;
  for (let i = 0; i < series.days.length; i++) {
    const s = series.stock[i] as number;
    const d = series.days[i] as number;
    if (s <= 0 && start === null) start = d;
    if (s > 0 && start !== null) {
      out.push([start, d]);
      start = null;
    }
  }
  if (start !== null) out.push([start, series.days[series.days.length - 1] as number]);
  return out;
}
