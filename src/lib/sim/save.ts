/**
 * Sauvegarde d'une partie : réglages, code de partie, décisions et commandes
 * forcées. Rien d'autre (le moteur rejoue la partie). Le même format sert au
 * stockage local du navigateur et au fichier « Télécharger ma partie ».
 * La lecture vérifie et borne chaque valeur : un fichier modifié à la main ne
 * peut pas casser la page.
 */
import {
  MONTHS,
  TOTAL_WEEKS,
  type ForcedOrder,
  type GameConfig,
  type ItemDecision,
  type MonthDecision,
} from './engine';
import { PROFILE_KEYS, SCENARIOS, type Profile, type ProfileKey } from './scenario';

export const SAVE_APP = 'stock-o-metre-simulation';
export const SAVE_VERSION = 1;
export const STORAGE_KEY = 'stock-o-metre:simulation:v1';

export interface SaveData {
  app: typeof SAVE_APP;
  version: typeof SAVE_VERSION;
  config: GameConfig;
  decisions: MonthDecision[];
  forced: ForcedOrder[];
  /** Semaine jusqu'où la partie a été jouée. */
  week: number;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, min: number, max: number): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null;
const text = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.length <= max ? v : null;

export const LIMITS = {
  forecast: 100000,
  qty: 1000000,
  serviceMin: 50,
  serviceMax: 99.9,
  cv: [0, 2],
  leadWeeks: [1, 12],
  leadSd: [0, 4],
  eventCount: [0, 10],
  warehouse: [1, 100000],
} as const;

function parseProfile(v: unknown): Profile | null {
  if (!isObj(v)) return null;
  const cv = num(v.cv, ...LIMITS.cv);
  const leadWeeks = num(v.leadWeeks, ...LIMITS.leadWeeks);
  const leadSd = num(v.leadSd, ...LIMITS.leadSd);
  const eventCount = num(v.eventCount, ...LIMITS.eventCount);
  const warehouse = num(v.warehouse, ...LIMITS.warehouse);
  const events = v.events;
  const shortage = v.shortage;
  if (
    cv === null ||
    leadWeeks === null ||
    leadSd === null ||
    eventCount === null ||
    warehouse === null ||
    (events !== 'announced' && events !== 'partial' && events !== 'hidden') ||
    (shortage !== 'backorder' && shortage !== 'lost')
  )
    return null;
  return {
    cv,
    leadWeeks: Math.round(leadWeeks),
    leadSd,
    eventCount: Math.round(eventCount),
    events,
    shortage,
    warehouse: Math.round(warehouse),
  };
}

export function parseConfig(v: unknown): GameConfig | null {
  if (!isObj(v) || v.version !== 1) return null;
  const scenario = text(v.scenario, 40);
  if (!scenario || !SCENARIOS[scenario]) return null;
  const company = text(v.company, 80);
  const currency = text(v.currency, 8);
  const unit = text(v.unit, 30);
  const seed = num(v.seed, 0, 4294967295);
  const profile = parseProfile(v.profile);
  const key = v.profileKey;
  const profileKey =
    key === 'custom' || PROFILE_KEYS.includes(key as ProfileKey)
      ? (key as ProfileKey | 'custom')
      : null;
  if (
    company === null ||
    currency === null ||
    unit === null ||
    seed === null ||
    !profile ||
    !profileKey
  )
    return null;
  return {
    version: 1,
    scenario,
    company,
    currency,
    unit,
    profileKey,
    profile,
    seed: Math.floor(seed),
  };
}

export function parseItemDecision(v: unknown): ItemDecision | null {
  if (!isObj(v) || !Array.isArray(v.forecast) || v.forecast.length !== 3) return null;
  const f = v.forecast.map((x) => num(x, 0, LIMITS.forecast));
  const service = num(v.service, LIMITS.serviceMin, LIMITS.serviceMax);
  const qty = num(v.qty, 0, LIMITS.qty);
  if (f.some((x) => x === null) || service === null || qty === null) return null;
  return { forecast: f as [number, number, number], service, qty: Math.round(qty) };
}

export function parseSave(raw: string): SaveData | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(data) || data.app !== SAVE_APP || data.version !== SAVE_VERSION) return null;
  const config = parseConfig(data.config);
  if (!config) return null;
  const items = (SCENARIOS[config.scenario]?.items ?? []).map((i) => i.id);
  if (!Array.isArray(data.decisions) || data.decisions.length > MONTHS) return null;
  const decisions: MonthDecision[] = [];
  for (const d of data.decisions) {
    if (!isObj(d)) return null;
    const out: MonthDecision = {};
    for (const id of items) {
      const dec = parseItemDecision(d[id]);
      if (!dec) return null;
      out[id] = dec;
    }
    decisions.push(out);
  }
  if (!Array.isArray(data.forced) || data.forced.length > 2000) return null;
  const forced: ForcedOrder[] = [];
  for (const f of data.forced) {
    if (!isObj(f)) return null;
    const week = num(f.week, 0, TOTAL_WEEKS - 1);
    const qty = num(f.qty, 1, LIMITS.qty);
    if (week === null || qty === null || typeof f.item !== 'string' || !items.includes(f.item))
      return null;
    forced.push({
      week: Math.floor(week),
      item: f.item,
      qty: Math.round(qty),
      express: f.express === true,
    });
  }
  const week = num(data.week, 0, TOTAL_WEEKS);
  if (week === null) return null;
  return {
    app: SAVE_APP,
    version: SAVE_VERSION,
    config,
    decisions,
    forced,
    week: Math.floor(week),
  };
}

export function serialize(save: SaveData): string {
  return JSON.stringify(save);
}
