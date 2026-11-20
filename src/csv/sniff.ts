export type Delimiter = ';' | ',' | '\t';

export const DELIMITERS: readonly Delimiter[] = [';', ',', '\t'];

/** Compte les occurrences d'un caractère hors des champs entre guillemets. */
function countOutsideQuotes(line: string, ch: string): number {
  let inQuotes = false;
  let n = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ch && !inQuotes) n++;
  }
  return n;
}

/**
 * Détecte le séparateur de colonnes parmi « ; », « , » et tabulation.
 *
 * Pour chaque candidat, on compte ses occurrences (hors guillemets) sur les
 * 50 premières lignes non vides. Un bon séparateur apparaît le même nombre de fois
 * sur presque toutes les lignes (≥ 80 %). Parmi les candidats réguliers, on retient
 * celui qui produit le plus de colonnes : ainsi « 12,5 » dans un fichier séparé
 * par « ; » ne trompe pas la détection (la virgule y est moins fréquente et
 * irrégulière, notamment sur la ligne d'en-tête).
 */
export function detectDelimiter(text: string): Delimiter {
  const lines: string[] = [];
  let start = 0;
  while (lines.length < 50 && start < text.length) {
    let end = text.indexOf('\n', start);
    if (end === -1) end = text.length;
    const line = text.slice(start, end).replace(/\r$/, '');
    if (line.trim() !== '') lines.push(line);
    start = end + 1;
  }
  if (lines.length === 0) return ';';

  let best: { d: Delimiter; consistency: number; mode: number } | null = null;
  for (const d of DELIMITERS) {
    const counts = lines.map((l) => countOutsideQuotes(l, d));
    const freq = new Map<number, number>();
    for (const c of counts) freq.set(c, (freq.get(c) ?? 0) + 1);
    let mode = 0;
    let modeFreq = 0;
    for (const [c, f] of freq) {
      if (c > 0 && (f > modeFreq || (f === modeFreq && c > mode))) {
        mode = c;
        modeFreq = f;
      }
    }
    if (mode === 0) continue;
    const consistency = modeFreq / lines.length;
    if (consistency < 0.8) continue;
    if (!best || mode > best.mode || (mode === best.mode && consistency > best.consistency)) {
      best = { d, consistency, mode };
    }
  }
  if (best) return best.d;
  // Aucun candidat régulier : on prend le plus fréquent sur la première ligne (en-tête).
  const header = lines[0] as string;
  let fallback: Delimiter = ';';
  let max = 0;
  for (const d of DELIMITERS) {
    const c = countOutsideQuotes(header, d);
    if (c > max) {
      max = c;
      fallback = d;
    }
  }
  return fallback;
}
