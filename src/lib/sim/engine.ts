/**
 * Moteur de la simulation d'entreprise (scénario A, « Le négoce de pièces »).
 *
 * Principe : une partie n'est jamais stockée comme un état, mais comme
 * « réglages + code de partie + décisions ». Le moteur rejoue la partie
 * semaine par semaine à partir de ces éléments, toujours à l'identique.
 *
 * Chaque semaine, pour chaque article :
 *  1. commandes forcées (début de semaine) puis réceptions ;
 *  2. ventes : reliquats servis d'abord, puis la demande de la semaine ;
 *  3. réapprovisionnement en fin de semaine : si position ≤ PC, commande de Q ;
 *  4. coûts : possession, dépassement d'entrepôt, pénalités de rupture.
 *
 * Un « pilote automatique » joue la même demande en parallèle, avec les
 * réglages du mois 1 gardés pendant toute la partie.
 */
import { normInv } from '../../engine/normal';
import { ceilUnit } from '../../engine/safety';
import { mean, sampleStdDev } from '../../engine/stats';
import { int, normal, stream } from './rng';
import { SCENARIOS, type ItemDef, type Profile, type ProfileKey, type Scenario } from './scenario';

// --- Calendrier 4-4-5 : 24 mois, 104 semaines ---------------------------------

export const MONTHS = 24;
export const WEEKS_IN_MONTH: readonly number[] = Array.from({ length: MONTHS }, (_, m) =>
  m % 3 === 2 ? 5 : 4,
);
const MONTH_START: readonly number[] = WEEKS_IN_MONTH.reduce<number[]>(
  (acc, n) => [...acc, (acc[acc.length - 1] as number) + n],
  [0],
);
export const TOTAL_WEEKS = MONTH_START[MONTHS] as number;
export const HISTORY_WEEKS = 52;
/** Fenêtre de calcul de l'écart-type de l'erreur de prévision et de la moyenne mobile. */
export const WINDOW = 13;
export const PLAN_MONTHS = 3;
/** Le stock est contrôlé une fois par semaine : période de revue R = 1 semaine. */
export const REVIEW_WEEKS = 1;

/** Première semaine (0 à 103) du mois m (0 à 24). */
export function monthStart(m: number): number {
  return MONTH_START[Math.max(0, Math.min(MONTHS, m))] as number;
}

/** Mois (0 à 23) d'une semaine de jeu. */
export function monthOfWeek(w: number): number {
  let m = 0;
  while (m < MONTHS - 1 && monthStart(m + 1) <= w) m++;
  return m;
}

// --- Types ----------------------------------------------------------------------

export interface GameConfig {
  version: 1;
  scenario: string;
  company: string;
  currency: string;
  unit: string;
  profileKey: ProfileKey | 'custom';
  profile: Profile;
  seed: number;
}

export interface ItemDecision {
  /** Prévision de demande hebdomadaire pour le mois joué et les deux suivants. */
  forecast: [number, number, number];
  /** Taux de service visé, en % (50 à 99,9). */
  service: number;
  /** Quantité commandée à chaque passage sous le point de commande (0 = plus de commande). */
  qty: number;
}
export type MonthDecision = Record<string, ItemDecision>;

export interface ForcedOrder {
  week: number;
  item: string;
  qty: number;
  express: boolean;
}

export interface GamePlan {
  decisions: MonthDecision[];
  forced: ForcedOrder[];
}

export type EventType = 'promo' | 'delay' | 'priceRise' | 'shift' | 'launch' | 'endOfLife';

export interface GameEvent {
  type: EventType;
  item: string;
  month: number;
  factor: number;
  /** Mois de la réunion S&OP où l'événement est annoncé ; null s'il n'est découvert qu'en arrivant. */
  announce: number | null;
}

export interface World {
  scenario: Scenario;
  profile: Profile;
  /** Demande des 52 semaines d'historique, par article. */
  history: Record<string, number[]>;
  /** Demande des 104 semaines de jeu, par article. */
  demand: Record<string, number[]>;
  /** Délai tiré pour une commande passée chaque semaine, par article. */
  lead: Record<string, number[]>;
  /** Coefficient du coût d'achat, par mois. */
  costFactor: Record<string, number[]>;
  /** Mois avec incident fournisseur, par article. */
  delayed: Record<string, boolean[]>;
  /** Erreurs de prévision de l'historique (moyenne mobile 13 semaines). */
  historyErrors: Record<string, number[]>;
  events: GameEvent[];
}

export interface Policy {
  forecast: [number, number, number];
  service: number;
  qty: number;
  sigma: number;
  ss: number;
  rop: number;
}

interface Lot {
  qty: number;
  arrival: number;
  expected: number;
  cost: number;
}

export interface ItemTotals {
  demand: number;
  served: number;
  short: number;
}

export interface ItemState {
  onHand: number;
  value: number;
  backlog: number;
  pipeline: Lot[];
  errors: number[];
  last: ItemTotals;
  cum: ItemTotals;
}

export interface Totals {
  revenue: number;
  cogs: number;
  ordering: number;
  holding: number;
  overflow: number;
  shortage: number;
  obsolescence: number;
  demand: number;
  served: number;
  short: number;
  ruptureWeeks: number;
  itemWeeks: number;
  orders: number;
  express: number;
  stockWeeks: number;
}

export interface MonthRecord {
  month: number;
  result: number;
  revenue: number;
  costs: number;
  stockValue: number;
  pallets: number;
  fillRate: number;
  demand: number;
  served: number;
}

export interface Company {
  items: Record<string, ItemState>;
  policy: Record<string, Policy>;
  totals: Totals;
  months: MonthRecord[];
  pallets: number;
}

export interface Game {
  config: GameConfig;
  world: World;
  player: Company;
  pilot: Company;
  /** Prochaine semaine à jouer (0 à 104). */
  week: number;
  /** Mois de la prochaine semaine à jouer. */
  month: number;
  /** Vrai quand le moteur attend les décisions de la réunion S&OP du mois. */
  awaiting: boolean;
  finished: boolean;
}

// --- Génération du monde (indépendante des décisions) ---------------------------

const calendarMonth = (gameWeek: number): number =>
  gameWeek >= 0 ? monthOfWeek(gameWeek) % 12 : monthOfWeek(gameWeek + HISTORY_WEEKS) % 12;

const isListed = (def: ItemDef, w: number): boolean =>
  def.launchMonth === undefined || w >= monthStart(def.launchMonth);

export function scenarioOf(config: GameConfig): Scenario {
  const s = SCENARIOS[config.scenario];
  if (!s) throw new Error(`Scénario inconnu : ${config.scenario}`);
  return s;
}

function drawEvents(seed: number, scenario: Scenario, profile: Profile): GameEvent[] {
  const rng = stream(seed, 'events');
  const events: GameEvent[] = [];
  for (const def of scenario.items) {
    if (def.launchMonth !== undefined)
      events.push({
        type: 'launch',
        item: def.id,
        month: def.launchMonth,
        factor: 1,
        announce: Math.max(0, def.launchMonth - 1),
      });
    if (def.endMonth !== undefined)
      events.push({
        type: 'endOfLife',
        item: def.id,
        month: def.endMonth,
        factor: 0,
        announce: Math.max(0, def.endMonth - 3),
      });
  }
  const types: EventType[] = ['promo', 'delay', 'priceRise', 'shift'];
  const taken = new Set<string>();
  let tries = 0;
  let drawn = 0;
  while (drawn < profile.eventCount && tries < 200) {
    tries++;
    const type = types[int(rng, 0, types.length - 1)] as EventType;
    const def = scenario.items[int(rng, 0, scenario.items.length - 1)] as ItemDef;
    const month = int(rng, 2, MONTHS - 3);
    const factor =
      type === 'promo'
        ? 1.6
        : type === 'delay'
          ? scenario.delayWeeks
          : type === 'priceRise'
            ? 1.08
            : rng() < 0.5
              ? 1.25
              : 0.8;
    const live =
      (def.launchMonth === undefined || month >= def.launchMonth + 1) &&
      (def.endMonth === undefined || month < def.endMonth - 1);
    const key = `${def.id}|${month}`;
    if (!live || taken.has(key) || (type === 'promo' && def.pattern.kind === 'lumpy')) continue;
    taken.add(key);
    drawn++;
    const shown =
      profile.events === 'announced' ||
      (profile.events === 'partial' && (type === 'promo' || type === 'priceRise'));
    events.push({ type, item: def.id, month, factor, announce: shown ? month - 1 : null });
  }
  return events.sort((a, b) => a.month - b.month || a.item.localeCompare(b.item));
}

/** Coefficient de demande d'un mois de jeu (événements, lancement, fin de vie). */
function demandFactor(def: ItemDef, events: GameEvent[], month: number): number {
  if (def.endMonth !== undefined && month >= def.endMonth) return 0;
  let f = 1;
  if (def.launchMonth !== undefined) {
    const k = month - def.launchMonth;
    if (k < 0) return 0;
    f *= ([0.4, 0.7] as const)[k] ?? 1;
  }
  for (const e of events) {
    if (e.item !== def.id) continue;
    if (e.type === 'promo' && e.month === month) f *= e.factor;
    if (e.type === 'shift' && month >= e.month) f *= e.factor;
  }
  return f;
}

export function buildWorld(config: GameConfig): World {
  const scenario = scenarioOf(config);
  const profile = config.profile;
  const events = drawEvents(config.seed, scenario, profile);
  const world: World = {
    scenario,
    profile,
    history: {},
    demand: {},
    lead: {},
    costFactor: {},
    delayed: {},
    historyErrors: {},
    events,
  };
  for (const def of scenario.items) {
    const rng = stream(config.seed, `demand:${def.id}`);
    const series: number[] = [];
    for (let t = -HISTORY_WEEKS; t < TOTAL_WEEKS; t++) {
      const month = t >= 0 ? monthOfWeek(t) : -1;
      const pattern =
        def.pattern.kind === 'trend'
          ? 1 + (def.pattern.perYear * t) / 52
          : def.pattern.kind === 'seasonal'
            ? (def.pattern.factors[calendarMonth(t)] ?? 1)
            : 1;
      const factor =
        t >= 0 ? demandFactor(def, events, month) : def.launchMonth !== undefined ? 0 : 1;
      let q: number;
      if (def.pattern.kind === 'lumpy') {
        let sum = 0;
        for (let c = 0; c < def.pattern.customers; c++) {
          const hit = rng() < def.pattern.probability;
          const size = Math.max(1, Math.round(def.base * (1 + profile.cv * normal(rng))));
          if (hit) sum += size;
        }
        q = Math.round(sum * factor);
      } else {
        const level = def.base * pattern * factor;
        q = Math.max(0, Math.round(level * (1 + profile.cv * normal(rng))));
      }
      series.push(factor === 0 ? 0 : q);
    }
    world.history[def.id] = series.slice(0, HISTORY_WEEKS);
    world.demand[def.id] = series.slice(HISTORY_WEEKS);

    const lr = stream(config.seed, `lead:${def.id}`);
    world.lead[def.id] = Array.from({ length: TOTAL_WEEKS }, () =>
      Math.max(1, Math.round(profile.leadWeeks + profile.leadSd * normal(lr))),
    );

    const cost: number[] = [];
    const delayed: boolean[] = [];
    for (let m = 0; m < MONTHS; m++) {
      let f = 1;
      let late = false;
      for (const e of events) {
        if (e.item !== def.id) continue;
        if (e.type === 'priceRise' && m >= e.month) f *= e.factor;
        if (e.type === 'delay' && m === e.month) late = true;
      }
      cost.push(f);
      delayed.push(late);
    }
    world.costFactor[def.id] = cost;
    world.delayed[def.id] = delayed;

    const hist = world.history[def.id] as number[];
    const errors: number[] = [];
    for (let k = WINDOW; k < hist.length; k++) {
      if (def.launchMonth !== undefined) break;
      errors.push((hist[k] as number) - mean(hist.slice(k - WINDOW, k)));
    }
    world.historyErrors[def.id] = errors;
  }
  return world;
}

// --- Règles de stock --------------------------------------------------------------

/**
 * Stock de sécurité et point de commande, mêmes formules que les calculateurs du
 * site, avec R = 1 semaine (le stock est contrôlé chaque fin de semaine) :
 * SS = Z·σ·√(L+R), ou Z·√((L+R)·σ² + d²·σL²) si le délai varie ; PC = d·(L+R) + SS.
 */
export function policyFor(
  profile: Profile,
  decision: ItemDecision,
  sigma: number,
): Policy & { ssRaw: number } {
  const L = profile.leadWeeks + REVIEW_WEEKS;
  const d = decision.forecast[0];
  const z = normInv(Math.min(99.99, Math.max(50, decision.service)) / 100);
  const ssRaw = Math.max(
    0,
    profile.leadSd > 0
      ? z * Math.sqrt(L * sigma ** 2 + d ** 2 * profile.leadSd ** 2)
      : z * sigma * Math.sqrt(L),
  );
  return {
    forecast: [...decision.forecast],
    service: decision.service,
    qty: decision.qty,
    sigma,
    ssRaw,
    ss: ceilUnit(ssRaw),
    rop: ceilUnit(d * L + ssRaw),
  };
}

/** Quantité économique de Wilson, arrondie à la dizaine. */
export function eoq(
  weeklyDemand: number,
  orderCost: number,
  unitCost: number,
  rate: number,
): number {
  const D = 52 * weeklyDemand;
  if (!(D > 0) || !(unitCost > 0) || !(rate > 0)) return 0;
  const q = Math.sqrt((2 * D * orderCost) / (unitCost * rate));
  return Math.max(10, Math.round(q / 10) * 10);
}

/** Écart-type de l'erreur de prévision sur les 13 dernières semaines (repli : CV × prévision). */
export function sigmaOf(errors: readonly number[], cv: number, forecast: number): number {
  const recent = errors.slice(-WINDOW);
  return recent.length >= 4 ? sampleStdDev(recent) : cv * forecast;
}

/** Moyenne des ventes des 13 dernières semaines (ou estimation du commercial). */
function movingAverage(world: World, def: ItemDef, week: number): number {
  const all = [...(world.history[def.id] as number[]), ...(world.demand[def.id] as number[])];
  const end = HISTORY_WEEKS + week;
  const first = def.launchMonth !== undefined ? HISTORY_WEEKS + monthStart(def.launchMonth) : 0;
  const start = Math.max(first, end - WINDOW);
  if (end - start < 1) return 0;
  return mean(all.slice(start, end));
}

/** Suggestion de la réunion S&OP pour un article au mois m. */
export function suggestion(world: World, def: ItemDef, month: number, service = 95): ItemDecision {
  const week = monthStart(month);
  const forecast = [0, 1, 2].map((k) => {
    const m = month + k;
    if (def.launchMonth !== undefined && m < def.launchMonth) return 0;
    if (def.launchMonth !== undefined && month <= def.launchMonth)
      return def.launchEstimate ?? def.base;
    return Math.round(movingAverage(world, def, week));
  }) as [number, number, number];
  const avg = mean(forecast);
  const cost = def.unitCost * ((world.costFactor[def.id] as number[])[month] ?? 1);
  return { forecast, service, qty: eoq(avg, def.orderCost, cost, world.scenario.holdingRate) };
}

// --- État d'une entreprise --------------------------------------------------------

const emptyTotals = (): Totals => ({
  revenue: 0,
  cogs: 0,
  ordering: 0,
  holding: 0,
  overflow: 0,
  shortage: 0,
  obsolescence: 0,
  demand: 0,
  served: 0,
  short: 0,
  ruptureWeeks: 0,
  itemWeeks: 0,
  orders: 0,
  express: 0,
  stockWeeks: 0,
});

/** Résultat logistique = marge brute − coûts. */
export function resultOf(t: Totals): number {
  return t.revenue - t.cogs - costsOf(t);
}

export function costsOf(t: Totals): number {
  return t.ordering + t.holding + t.overflow + t.shortage + t.obsolescence;
}

export function stockValue(c: Company): number {
  return Object.values(c.items).reduce((s, i) => s + i.value, 0);
}

function newCompany(world: World, initial: Record<string, number>): Company {
  const items: Record<string, ItemState> = {};
  for (const def of world.scenario.items) {
    const q = initial[def.id] ?? 0;
    items[def.id] = {
      onHand: q,
      value: q * def.unitCost,
      backlog: 0,
      pipeline: [],
      errors: [...(world.historyErrors[def.id] as number[])],
      last: { demand: 0, served: 0, short: 0 },
      cum: { demand: 0, served: 0, short: 0 },
    };
  }
  return { items, policy: {}, totals: emptyTotals(), months: [], pallets: 0 };
}

const inactive = (): Policy => ({
  forecast: [0, 0, 0],
  service: 95,
  qty: 0,
  sigma: 0,
  ss: 0,
  rop: 0,
});

function placeOrder(
  world: World,
  c: Company,
  def: ItemDef,
  st: ItemState,
  qty: number,
  expected: number,
  arrival: number,
  express: boolean,
  month: number,
): void {
  const factor = (world.costFactor[def.id] as number[])[month] ?? 1;
  const cost = def.unitCost * factor * (express ? 1 + world.scenario.expressSurcharge : 1);
  st.pipeline.push({ qty, arrival, expected, cost });
  c.totals.ordering += def.orderCost;
  c.totals.orders += 1;
  if (express) c.totals.express += 1;
}

function stepWeek(world: World, c: Company, forced: readonly ForcedOrder[], w: number): void {
  const { scenario, profile } = world;
  const month = monthOfWeek(w);
  let pallets = 0;
  for (const def of scenario.items) {
    const st = c.items[def.id] as ItemState;
    const pol = c.policy[def.id] ?? inactive();
    const delay = (world.delayed[def.id] as boolean[])[month] ? scenario.delayWeeks : 0;

    // 1. Commandes forcées (début de semaine), puis réceptions.
    for (const f of forced) {
      if (f.week !== w || f.item !== def.id || !(f.qty > 0)) continue;
      const lead = f.express
        ? scenario.expressLead
        : ((world.lead[def.id] as number[])[w] as number) + delay;
      const nominal = f.express ? scenario.expressLead : profile.leadWeeks;
      placeOrder(world, c, def, st, f.qty, w + nominal, w + lead, f.express, month);
    }
    const arrived = st.pipeline.filter((l) => l.arrival <= w);
    st.pipeline = st.pipeline.filter((l) => l.arrival > w);
    for (const lot of arrived) {
      st.onHand += lot.qty;
      st.value += lot.qty * lot.cost;
    }

    // 2. Ventes.
    const D = (world.demand[def.id] as number[])[w] as number;
    const avg = st.onHand > 0 ? st.value / st.onHand : 0;
    let sold = 0;
    if (profile.shortage === 'backorder' && st.backlog > 0) {
      const b = Math.min(st.onHand, st.backlog);
      st.onHand -= b;
      st.backlog -= b;
      sold += b;
    }
    const served = Math.min(st.onHand, D);
    st.onHand -= served;
    sold += served;
    const short = D - served;
    if (profile.shortage === 'backorder') st.backlog += short;
    c.totals.revenue += sold * def.price;
    c.totals.cogs += sold * avg;
    st.value = st.onHand > 0 ? st.value - sold * avg : 0;
    c.totals.shortage +=
      (profile.shortage === 'backorder' ? st.backlog : short) *
      def.price *
      scenario.shortagePenalty;
    c.totals.demand += D;
    c.totals.served += served;
    c.totals.short += short;
    st.last = { demand: D, served, short };
    st.cum.demand += D;
    st.cum.served += served;
    st.cum.short += short;
    if (isListed(def, w)) {
      st.errors.push(D - pol.forecast[0]);
      if (D > 0 || pol.forecast[0] > 0) {
        c.totals.itemWeeks += 1;
        if (short > 0) c.totals.ruptureWeeks += 1;
      }
    }

    // 3. Réapprovisionnement (fin de semaine) : point de commande.
    if (pol.qty > 0 && pol.forecast[0] > 0) {
      const onOrder = st.pipeline.reduce((s, l) => s + l.qty, 0);
      let position = st.onHand + onOrder - st.backlog;
      let n = 0;
      while (position <= pol.rop && n < 20) {
        const lead = ((world.lead[def.id] as number[])[w] as number) + delay;
        placeOrder(
          world,
          c,
          def,
          st,
          pol.qty,
          w + profile.leadWeeks + 1,
          w + lead + 1,
          false,
          month,
        );
        position += pol.qty;
        n++;
      }
    }

    // 4. Possession.
    c.totals.holding += (st.value * scenario.holdingRate) / 52;
    pallets += Math.ceil(st.onHand / def.perPallet);
  }
  c.pallets = pallets;
  c.totals.overflow += Math.max(0, pallets - profile.warehouse) * scenario.overflowCost;
  c.totals.stockWeeks += stockValue(c);
}

function closeMonth(c: Company, month: number, before: Totals): void {
  const t = c.totals;
  const demand = t.demand - before.demand;
  const served = t.served - before.served;
  c.months.push({
    month,
    result: resultOf(t) - resultOf(before),
    revenue: t.revenue - before.revenue,
    costs: costsOf(t) - costsOf(before),
    stockValue: stockValue(c),
    pallets: c.pallets,
    fillRate: demand > 0 ? served / demand : 1,
    demand,
    served,
  });
}

function applyObsolescence(world: World, c: Company): void {
  for (const def of world.scenario.items) {
    if (def.endMonth === undefined) continue;
    const st = c.items[def.id] as ItemState;
    const loss = st.value * (1 - world.scenario.obsoleteValue);
    c.totals.obsolescence += loss;
    st.value -= loss;
  }
}

/** Décisions du pilote automatique : suggestions du mois 1 (ou du lancement), à 95 %. */
function pilotDecision(world: World, def: ItemDef, month: number): ItemDecision {
  return suggestion(world, def, month);
}

/**
 * Rejoue la partie jusqu'à la semaine `untilWeek` (ou jusqu'à la prochaine
 * réunion S&OP sans décision).
 */
export function runGame(config: GameConfig, plan: GamePlan, untilWeek = TOTAL_WEEKS): Game {
  const world = buildWorld(config);
  const { profile, scenario } = world;

  // Stock de départ : PC + Q/2 selon les réglages du pilote au mois 1.
  const initial: Record<string, number> = {};
  const pilotPolicy: Record<string, Policy> = {};
  for (const def of scenario.items) {
    const dec = pilotDecision(world, def, 0);
    const sigma = sigmaOf(world.historyErrors[def.id] as number[], profile.cv, dec.forecast[0]);
    const p = policyFor(profile, dec, sigma);
    pilotPolicy[def.id] = p;
    initial[def.id] = dec.forecast[0] > 0 ? ceilUnit(p.rop + p.qty / 2) : 0;
  }
  const player = newCompany(world, initial);
  const pilot = newCompany(world, initial);
  pilot.policy = { ...pilotPolicy };

  const limit = Math.max(0, Math.min(TOTAL_WEEKS, untilWeek));
  let w = 0;
  let awaiting = false;
  let beforePlayer = { ...player.totals };
  let beforePilot = { ...pilot.totals };
  while (w < limit) {
    const m = monthOfWeek(w);
    if (w === monthStart(m)) {
      const dec = plan.decisions[m];
      if (!dec) {
        awaiting = true;
        break;
      }
      for (const def of scenario.items) {
        const d = dec[def.id] ?? suggestion(world, def, m);
        const st = player.items[def.id] as ItemState;
        player.policy[def.id] = policyFor(
          profile,
          d,
          sigmaOf(st.errors, profile.cv, d.forecast[0]),
        );
        if (m > 0 && def.launchMonth === m) {
          const pd = pilotDecision(world, def, m);
          const pst = pilot.items[def.id] as ItemState;
          pilot.policy[def.id] = policyFor(
            profile,
            pd,
            sigmaOf(pst.errors, profile.cv, pd.forecast[0]),
          );
        }
      }
      beforePlayer = { ...player.totals };
      beforePilot = { ...pilot.totals };
    }
    stepWeek(world, player, plan.forced, w);
    stepWeek(world, pilot, [], w);
    w++;
    if (w === monthStart(m + 1)) {
      closeMonth(player, m, beforePlayer);
      closeMonth(pilot, m, beforePilot);
    }
  }
  const finished = w >= TOTAL_WEEKS;
  if (finished) {
    applyObsolescence(world, player);
    applyObsolescence(world, pilot);
  }
  const month = finished ? MONTHS : monthOfWeek(w);
  if (!finished && w === monthStart(month) && !plan.decisions[month]) awaiting = true;
  return { config, world, player, pilot, week: w, month, awaiting, finished };
}

// --- Plan (PIC) : projection des 3 mois suivants -----------------------------------

export interface PlanCell {
  sales: number;
  receipts: number;
  stockEnd: number;
  cover: number | null;
}
export interface PlanResult {
  months: number[];
  families: Record<string, PlanCell[]>;
  pallets: number[];
}

/**
 * Rejoue les mois à venir avec une demande égale à la prévision et les délais
 * nominaux (les retards ne sont pas connus d'avance).
 */
export function projectPlan(game: Game, decision: MonthDecision): PlanResult {
  const { world } = game;
  const { scenario, profile } = world;
  const start = game.month;
  const months = [0, 1, 2].map((k) => start + k).filter((m) => m < MONTHS);
  const families: Record<string, PlanCell[]> = {};
  for (const f of scenario.families)
    families[f] = months.map(() => ({ sales: 0, receipts: 0, stockEnd: 0, cover: null }));
  const pallets = months.map(() => 0);
  const nextDemand: Record<string, number[]> = {};
  for (const f of scenario.families) nextDemand[f] = months.map(() => 0);

  for (const def of scenario.items) {
    const st = game.player.items[def.id] as ItemState;
    const d = decision[def.id] ?? suggestion(world, def, start);
    const pol = policyFor(profile, d, sigmaOf(st.errors, profile.cv, d.forecast[0]));
    let net = st.onHand - st.backlog;
    const lots = st.pipeline.map((l) => ({ qty: l.qty, at: l.expected }));
    let onOrder = lots.reduce((s, l) => s + l.qty, 0);
    const cells = families[def.family] as PlanCell[];
    months.forEach((m, k) => {
      const f = d.forecast[k] ?? 0;
      const cell = cells[k] as PlanCell;
      for (let w = monthStart(m); w < monthStart(m + 1); w++) {
        for (const lot of lots) {
          if (lot.at === w) {
            net += lot.qty;
            onOrder -= lot.qty;
            cell.receipts += lot.qty;
          }
        }
        net -= f;
        cell.sales += f;
        if (pol.qty > 0 && f > 0) {
          let position = net + onOrder;
          let n = 0;
          while (position <= pol.rop && n < 20) {
            lots.push({ qty: pol.qty, at: w + profile.leadWeeks + 1 });
            onOrder += pol.qty;
            position += pol.qty;
            n++;
          }
        }
      }
      cell.stockEnd += net;
      const nd = nextDemand[def.family] as number[];
      nd[k] = (nd[k] ?? 0) + (d.forecast[Math.min(2, k + 1)] ?? f);
      pallets[k] = (pallets[k] ?? 0) + Math.ceil(Math.max(0, net) / def.perPallet);
    });
  }
  for (const f of scenario.families) {
    (families[f] as PlanCell[]).forEach((cell, k) => {
      const nd = (nextDemand[f] as number[])[k] as number;
      cell.cover = nd > 0 ? cell.stockEnd / nd : null;
    });
  }
  return { months, families, pallets };
}

// --- Indicateurs -------------------------------------------------------------------

export interface Kpis {
  result: number;
  fillRate: number;
  cycleRate: number;
  stockValue: number;
  averageStock: number;
  turns: number | null;
}

export function kpis(c: Company, weeks: number): Kpis {
  const t = c.totals;
  const averageStock = weeks > 0 ? t.stockWeeks / weeks : stockValue(c);
  const annualCogs = weeks > 0 ? (t.cogs * 52) / weeks : 0;
  return {
    result: resultOf(t),
    fillRate: t.demand > 0 ? t.served / t.demand : 1,
    cycleRate: t.itemWeeks > 0 ? 1 - t.ruptureWeeks / t.itemWeeks : 1,
    stockValue: stockValue(c),
    averageStock,
    turns: averageStock > 0 ? annualCogs / averageStock : null,
  };
}

/** Décisions par défaut de la réunion du mois : celles du mois précédent, prévision décalée. */
export function defaultDecision(game: Game): MonthDecision {
  const out: MonthDecision = {};
  for (const def of game.world.scenario.items) {
    const prev = game.player.policy[def.id];
    const sug = suggestion(game.world, def, game.month, prev?.service ?? 95);
    const launching = def.launchMonth !== undefined && game.month === def.launchMonth;
    if (!prev || game.month === 0 || launching || (prev.forecast[0] === 0 && sug.forecast[0] > 0)) {
      out[def.id] = sug;
    } else {
      out[def.id] = {
        forecast: [prev.forecast[1], prev.forecast[2], prev.forecast[2]],
        service: prev.service,
        qty: prev.qty,
      };
    }
  }
  return out;
}

/** Événements à afficher à la réunion S&OP du mois m. */
export function meetingEvents(
  world: World,
  m: number,
): { upcoming: GameEvent[]; past: GameEvent[] } {
  return {
    upcoming: world.events.filter((e) => e.announce !== null && e.announce <= m && e.month >= m),
    past: world.events.filter((e) => e.month === m - 1),
  };
}

export function newConfig(profileKey: ProfileKey, seed: number, scenario = 'negoce'): GameConfig {
  const s = SCENARIOS[scenario] as Scenario;
  return {
    version: 1,
    scenario,
    company: '',
    currency: '€',
    unit: '',
    profileKey,
    profile: { ...s.profiles[profileKey] },
    seed,
  };
}
