/**
 * Hasard reproductible de la simulation : un générateur pseudo-aléatoire
 * (mulberry32) par « flux », initialisé à partir du code de partie et d'un nom
 * de flux. Chaque article a son propre flux de demande et son propre flux de
 * délais : la demande ne dépend donc jamais des décisions du joueur.
 */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Empreinte FNV-1a 32 bits d'un texte. */
export function hash32(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Flux indépendant pour un code de partie et un nom (« demand:R-6204 »…). */
export function stream(seed: number, name: string): Rng {
  return mulberry32(hash32(`${seed}|${name}`));
}

/** Tirage normal centré réduit (Box-Muller). */
export function normal(rng: Rng): number {
  const u = Math.max(rng(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

/** Entier uniforme dans [min ; max]. */
export function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Nouveau code de partie à 6 chiffres. */
export function randomSeed(): number {
  return 100000 + Math.floor(Math.random() * 900000);
}
