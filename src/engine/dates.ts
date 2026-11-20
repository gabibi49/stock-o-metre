/**
 * Dates « calendaires » représentées par un numéro de jour entier (jours depuis le
 * 1970-01-01, en UTC). Ce choix évite toute dérive due aux fuseaux horaires et
 * aux changements d'heure : un mouvement du 31/03 reste le 31/03 partout.
 */

export const MS_PER_DAY = 86_400_000;

export interface Ymd {
  y: number;
  m: number; // 1..12
  d: number; // 1..31
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

export function isValidYmd(y: number, m: number, d: number): boolean {
  return (
    Number.isInteger(y) &&
    Number.isInteger(m) &&
    Number.isInteger(d) &&
    y >= 1900 &&
    y <= 2200 &&
    m >= 1 &&
    m <= 12 &&
    d >= 1 &&
    d <= daysInMonth(y, m)
  );
}

export function dayFromYmd(y: number, m: number, d: number): number {
  return Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY);
}

export function ymdFromDay(day: number): Ymd {
  const dt = new Date(day * MS_PER_DAY);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

/** Jour de la semaine ISO : 1 = lundi … 7 = dimanche. Le 1970-01-01 était un jeudi. */
export function isoWeekday(day: number): number {
  return ((((day + 3) % 7) + 7) % 7) + 1;
}

/** Année et numéro de semaine ISO 8601 (la semaine 1 contient le premier jeudi de l'année). */
export function isoWeek(day: number): { year: number; week: number } {
  const thursday = day - isoWeekday(day) + 4;
  const year = ymdFromDay(thursday).y;
  const jan1 = dayFromYmd(year, 1, 1);
  return { year, week: Math.floor((thursday - jan1) / 7) + 1 };
}

const pad = (n: number, w = 2): string => String(n).padStart(w, '0');

export function formatIsoDay(day: number): string {
  const { y, m, d } = ymdFromDay(day);
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

/** Date JavaScript (minuit UTC) correspondant au jour, pour les graphiques. */
export function dayToTime(day: number): number {
  return day * MS_PER_DAY;
}
