/**
 * Données d'un scénario de simulation : articles, profils de difficulté,
 * paramètres de coûts. Le moteur (engine.ts) ne connaît que ces types : un
 * nouveau scénario (B : composants et produits finis) s'ajoute comme un
 * nouveau fichier de données.
 */

export type EventMode = 'announced' | 'partial' | 'hidden';
export type ShortageMode = 'backorder' | 'lost';
export type ProfileKey = 'easy' | 'normal' | 'hard';

export interface Profile {
  /** Coefficient de variation de la demande hebdomadaire. */
  cv: number;
  /** Délai fournisseur nominal, en semaines. */
  leadWeeks: number;
  /** Écart-type du délai, en semaines. */
  leadSd: number;
  /** Nombre d'événements tirés au début de la partie. */
  eventCount: number;
  events: EventMode;
  shortage: ShortageMode;
  /** Capacité de l'entrepôt, en palettes. */
  warehouse: number;
}

/** Forme de la demande d'un article. */
export type DemandPattern =
  | { kind: 'stable' }
  | { kind: 'trend'; perYear: number }
  | { kind: 'seasonal'; factors: readonly number[] }
  | { kind: 'lumpy'; customers: number; probability: number };

export interface ItemDef {
  id: string;
  family: string;
  /** « purchased » seulement dans le scénario A ; « manufactured » réservé au scénario B. */
  kind: 'purchased' | 'manufactured';
  /** Demande hebdomadaire moyenne (pour « lumpy » : taille moyenne d'une commande client). */
  base: number;
  pattern: DemandPattern;
  unitCost: number;
  price: number;
  orderCost: number;
  perPallet: number;
  /** Mois (0 à 23) de lancement : pas de demande ni d'historique avant. */
  launchMonth?: number;
  /** Estimation du commercial au lancement (demande hebdomadaire). */
  launchEstimate?: number;
  /** Mois (0 à 23) à partir duquel la demande s'arrête. */
  endMonth?: number;
  /** Scénario B : nomenclature et gamme (vides dans le scénario A). */
  bom?: { component: string; quantity: number }[];
  routing?: { seq: number; workCenter: string; setupHours: number; unitHours: number }[];
}

export interface Scenario {
  id: string;
  families: readonly string[];
  items: readonly ItemDef[];
  /** Postes de charge (scénario B). */
  workCenters: readonly string[];
  /** Taux de possession annuel (part de la valeur du stock). */
  holdingRate: number;
  /** Coût d'une palette hors capacité, par semaine. */
  overflowCost: number;
  /** Surcoût d'achat d'une commande express. */
  expressSurcharge: number;
  expressLead: number;
  /** Pénalité de rupture : part du prix de vente, par unité (et par semaine d'attente en reliquat). */
  shortagePenalty: number;
  /** Valeur résiduelle du stock d'un article en fin de vie à la fin de la partie. */
  obsoleteValue: number;
  /** Retard ajouté par un incident fournisseur, en semaines. */
  delayWeeks: number;
  profiles: Record<ProfileKey, Profile>;
}

/** Saisonnalité de la courroie C-A42 (janvier à décembre, moyenne 1). */
const SPRING = [0.8, 0.9, 1.2, 1.5, 1.4, 1.1, 0.9, 0.7, 0.8, 1.0, 0.9, 0.8] as const;

/** Scénario A : « Le négoce de pièces », 6 articles en 3 familles. */
export const NEGOCE: Scenario = {
  id: 'negoce',
  families: ['bearings', 'belts', 'filters'],
  items: [
    {
      id: 'R-6204',
      family: 'bearings',
      kind: 'purchased',
      base: 120,
      pattern: { kind: 'stable' },
      unitCost: 8,
      price: 12,
      orderCost: 40,
      perPallet: 60,
    },
    {
      id: 'R-6305',
      family: 'bearings',
      kind: 'purchased',
      base: 80,
      pattern: { kind: 'trend', perYear: 0.2 },
      unitCost: 14,
      price: 21,
      orderCost: 40,
      perPallet: 40,
    },
    {
      id: 'C-A42',
      family: 'belts',
      kind: 'purchased',
      base: 60,
      pattern: { kind: 'seasonal', factors: SPRING },
      unitCost: 11,
      price: 17,
      orderCost: 50,
      perPallet: 30,
    },
    {
      id: 'C-B55',
      family: 'belts',
      kind: 'purchased',
      base: 70,
      pattern: { kind: 'lumpy', customers: 3, probability: 0.2 },
      unitCost: 22,
      price: 34,
      orderCost: 50,
      perPallet: 20,
    },
    {
      id: 'F-H10',
      family: 'filters',
      kind: 'purchased',
      base: 50,
      pattern: { kind: 'stable' },
      unitCost: 9,
      price: 14,
      orderCost: 30,
      perPallet: 40,
      endMonth: 18,
    },
    {
      id: 'F-N20',
      family: 'filters',
      kind: 'purchased',
      base: 70,
      pattern: { kind: 'stable' },
      unitCost: 12,
      price: 19,
      orderCost: 30,
      perPallet: 40,
      launchMonth: 6,
      launchEstimate: 55,
    },
  ],
  workCenters: [],
  holdingRate: 0.25,
  overflowCost: 4,
  expressSurcharge: 0.15,
  expressLead: 1,
  shortagePenalty: 0.1,
  obsoleteValue: 0.2,
  delayWeeks: 2,
  profiles: {
    easy: {
      cv: 0.15,
      leadWeeks: 2,
      leadSd: 0,
      eventCount: 2,
      events: 'announced',
      shortage: 'backorder',
      warehouse: 80,
    },
    normal: {
      cv: 0.3,
      leadWeeks: 3,
      leadSd: 0.5,
      eventCount: 4,
      events: 'partial',
      shortage: 'backorder',
      warehouse: 70,
    },
    hard: {
      cv: 0.5,
      leadWeeks: 4,
      leadSd: 1,
      eventCount: 6,
      events: 'hidden',
      shortage: 'lost',
      warehouse: 85,
    },
  },
};

export const SCENARIOS: Record<string, Scenario> = { negoce: NEGOCE };
export const PROFILE_KEYS: readonly ProfileKey[] = ['easy', 'normal', 'hard'];
