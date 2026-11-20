import type { Delimiter } from './sniff';

export type DecimalSeparator = ',' | '.';

/**
 * Espaces (y compris insécable et fine insécable, couvertes par la classe d'espaces
 * des expressions régulières JavaScript) et apostrophes droite ou typographique,
 * utilisées comme séparateurs de milliers.
 */
const GROUP_SPACES = /[\s'’]/g;

/**
 * Lit un nombre écrit « à la française » (1 234,56 ; 1.234,56) ou « à l'anglaise »
 * (1,234.56 ; 1234.56), selon le séparateur décimal du fichier.
 *
 * - Les espaces et apostrophes sont toujours des séparateurs de milliers.
 * - L'autre signe (point ou virgule) n'est accepté que comme séparateur de milliers
 *   correctement placé (groupes de 3 chiffres). Ainsi « 1.5 » dans un fichier à
 *   virgule décimale est refusé plutôt que lu 15 : une erreur visible vaut mieux
 *   qu'un chiffre faux.
 * - Signe moins en tête ou en fin (« 12- », format de certains ERP), parenthèses
 *   comptables « (12) » = −12.
 *
 * Renvoie null si la valeur est vide ou illisible.
 */
export function parseNumber(raw: string, decimal: DecimalSeparator): number | null {
  let s = raw.trim();
  if (s === '') return null;
  let negative = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    negative = true;
    s = s.slice(1, -1).trim();
  }
  if (s.endsWith('-')) {
    negative = !negative;
    s = s.slice(0, -1).trim();
  }
  if (s.startsWith('-') || s.startsWith('−')) {
    negative = !negative;
    s = s.slice(1).trim();
  } else if (s.startsWith('+')) {
    s = s.slice(1).trim();
  }
  s = s.replace(GROUP_SPACES, '');
  if (s === '') return null;
  const group = decimal === ',' ? '.' : ',';
  const [intPart, fracPart, ...rest] = s.split(decimal);
  if (rest.length > 0 || intPart === undefined) return null;
  let digits = intPart;
  if (digits.includes(group)) {
    const groupRe = group === '.' ? /^\d{1,3}(\.\d{3})+$/ : /^\d{1,3}(,\d{3})+$/;
    if (!groupRe.test(digits)) return null;
    digits = digits.split(group).join('');
  }
  if (!/^\d*$/.test(digits)) return null;
  if (fracPart !== undefined && !/^\d+$/.test(fracPart)) return null;
  if (digits === '' && fracPart === undefined) return null;
  const value = Number(
    `${digits === '' ? '0' : digits}${fracPart !== undefined ? `.${fracPart}` : ''}`,
  );
  if (!Number.isFinite(value)) return null;
  return negative ? -value : value;
}

/**
 * Devine le séparateur décimal à partir d'échantillons de valeurs numériques.
 *
 * - « 1.234,5 » ou « 1,234.5 » : le dernier signe est le séparateur décimal.
 * - « 12,5 » ou « 0,333 » (pas un groupe de milliers valide) : virgule décimale.
 * - « 1,234 » est ambigu (mille deux cent trente-quatre, ou 1,234) : non décisif.
 * - Sans indice : virgule si le fichier est séparé par « ; » ou tabulation
 *   (usage français), point si le fichier est séparé par « , ».
 */
export function detectDecimalSeparator(
  samples: readonly string[],
  delimiter: Delimiter,
): DecimalSeparator {
  let comma = 0;
  let dot = 0;
  for (const raw of samples) {
    const s = raw
      .trim()
      .replace(GROUP_SPACES, '')
      .replace(/^[-+−(]+|[)-]+$/g, '');
    const nComma = s.split(',').length - 1;
    const nDot = s.split('.').length - 1;
    if (nComma > 0 && nDot > 0) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) comma++;
      else dot++;
    } else if (nComma > 0) {
      if (nComma > 1)
        dot++; // « 1,234,567 » : la virgule groupe les milliers
      else if (!isGrouping(s, ',')) comma++; // « 12,5 », « 0,333 »
    } else if (nDot > 0) {
      if (nDot > 1)
        comma++; // « 1.234.567 »
      else if (!isGrouping(s, '.')) dot++;
    }
  }
  if (comma > dot) return ',';
  if (dot > comma) return '.';
  return delimiter === ',' ? '.' : ',';
}

/** « 1,234 » : forme compatible avec un groupe de milliers (donc ambiguë). « 0,333 » ne l'est pas. */
function isGrouping(s: string, g: ',' | '.'): boolean {
  return (g === ',' ? /^[1-9]\d{0,2}(,\d{3})+$/ : /^[1-9]\d{0,2}(\.\d{3})+$/).test(s);
}
