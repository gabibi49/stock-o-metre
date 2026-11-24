import { describe, expect, it } from 'vitest';
import {
  defaultDecision,
  eoq,
  kpis,
  monthOfWeek,
  monthStart,
  newConfig,
  policyFor,
  projectPlan,
  runGame,
  suggestion,
  TOTAL_WEEKS,
  type GameConfig,
  type MonthDecision,
} from '../../src/lib/sim/engine';
import { parseSave, SAVE_APP, serialize, type SaveData } from '../../src/lib/sim/save';
import { NEGOCE } from '../../src/lib/sim/scenario';

/** Joue toute la partie en acceptant les suggestions de chaque réunion. */
function playAll(config: GameConfig, tweak?: (d: MonthDecision, month: number) => void) {
  const decisions: MonthDecision[] = [];
  let g = runGame(config, { decisions, forced: [] });
  while (!g.finished) {
    const d = defaultDecision(g);
    tweak?.(d, g.month);
    decisions.push(d);
    g = runGame(config, { decisions, forced: [] });
  }
  return { game: g, decisions };
}

describe('calendrier 4-4-5', () => {
  it('24 mois, 104 semaines', () => {
    expect(TOTAL_WEEKS).toBe(104);
    expect(monthStart(1)).toBe(4);
    expect(monthStart(3)).toBe(13);
    expect(monthOfWeek(12)).toBe(2);
    expect(monthOfWeek(13)).toBe(3);
    expect(monthOfWeek(103)).toBe(23);
  });
});

describe('règles de stock (exemple de la maquette)', () => {
  const profile = { ...NEGOCE.profiles.normal, leadWeeks: 3, leadSd: 0 };
  const dec = { forecast: [120, 120, 120] as [number, number, number], service: 95, qty: 500 };

  it('SS = Z·σ·√(L+R), PC = d·(L+R) + SS', () => {
    // 1,6449 × 36 × √4 = 118,43 → 119 ; PC = 120 × 4 + 118,43 = 598,43 → 599
    const p = policyFor(profile, dec, 36);
    expect(p.ssRaw).toBeCloseTo(118.43, 2);
    expect(p.ss).toBe(119);
    expect(p.rop).toBe(599);
  });

  it('délai variable : SS = Z·√((L+R)·σ² + d²·σL²)', () => {
    // √(4 × 1 296 + 14 400 × 0,25) = √8 784 = 93,72 ; × 1,6449 = 154,16 → 155
    const p = policyFor({ ...profile, leadSd: 0.5 }, dec, 36);
    expect(p.ssRaw).toBeCloseTo(154.16, 2);
    expect(p.ss).toBe(155);
  });

  it('Wilson : Q* = √(2 × 6 240 × 40 / 2) = 499,6 → 500', () => {
    expect(eoq(120, 40, 8, 0.25)).toBe(500);
    expect(eoq(0, 40, 8, 0.25)).toBe(0);
  });
});

describe('moteur', () => {
  const config = newConfig('normal', 482913);

  it('même code de partie = même partie', () => {
    const a = playAll(config).game;
    const b = playAll(config).game;
    expect(kpis(a.player, TOTAL_WEEKS)).toEqual(kpis(b.player, TOTAL_WEEKS));
    expect(a.world.events).toEqual(b.world.events);
  });

  it('la demande et le pilote ne dépendent pas des décisions du joueur', () => {
    const a = playAll(config).game;
    const b = playAll(config, (d) => {
      for (const id of Object.keys(d)) (d[id] as { service: number }).service = 99;
    }).game;
    expect(a.world.demand).toEqual(b.world.demand);
    expect(kpis(a.pilot, TOTAL_WEEKS)).toEqual(kpis(b.pilot, TOTAL_WEEKS));
    expect(kpis(a.player, TOTAL_WEEKS).result).not.toBe(kpis(b.player, TOTAL_WEEKS).result);
  });

  it('un autre code donne une autre demande', () => {
    const a = runGame(config, { decisions: [], forced: [] });
    const b = runGame({ ...config, seed: 482914 }, { decisions: [], forced: [] });
    expect(a.world.demand['R-6204']).not.toEqual(b.world.demand['R-6204']);
  });

  it('lancement au mois 7 et fin de vie au mois 19', () => {
    const g = runGame(config, { decisions: [], forced: [] });
    const n20 = g.world.demand['F-N20'] as number[];
    const h10 = g.world.demand['F-H10'] as number[];
    expect(n20.slice(0, monthStart(6)).every((q) => q === 0)).toBe(true);
    expect(n20.slice(monthStart(6)).some((q) => q > 0)).toBe(true);
    expect(h10.slice(monthStart(18)).every((q) => q === 0)).toBe(true);
    expect(g.world.history['F-N20']?.every((q) => q === 0)).toBe(true);
  });

  it('attend la réunion S&OP de chaque mois', () => {
    const g0 = runGame(config, { decisions: [], forced: [] });
    expect([g0.week, g0.month, g0.awaiting]).toEqual([0, 0, true]);
    const d0 = defaultDecision(g0);
    const g1 = runGame(config, { decisions: [d0], forced: [] });
    expect([g1.week, g1.month, g1.awaiting]).toEqual([4, 1, true]);
    // Semaine par semaine : arrêt au milieu du mois.
    const half = runGame(config, { decisions: [d0], forced: [] }, 2);
    expect([half.week, half.awaiting]).toEqual([2, false]);
  });

  it('ventes : servi + manquant = demandé ; aucun stock négatif', () => {
    const { game } = playAll(config);
    for (const st of Object.values(game.player.items)) {
      expect(st.cum.served + st.cum.short).toBe(st.cum.demand);
      expect(st.onHand).toBeGreaterThanOrEqual(0);
      expect(st.backlog).toBeGreaterThanOrEqual(0);
    }
    expect(game.player.months).toHaveLength(24);
    const t = game.player.totals;
    const sum = game.player.months.reduce((s, m) => s + m.result, 0);
    expect(sum).toBeCloseTo(
      t.revenue - t.cogs - t.ordering - t.holding - t.overflow - t.shortage,
      4,
    );
    expect(kpis(game.player, TOTAL_WEEKS).result).toBeCloseTo(sum - t.obsolescence, 4);
  });

  it('ventes perdues : aucun reliquat', () => {
    const lost = { ...config, profile: { ...config.profile, shortage: 'lost' as const } };
    const { game } = playAll(lost, (d) => {
      (d['C-B55'] as { qty: number }).qty = 0;
    });
    expect(Object.values(game.player.items).every((s) => s.backlog === 0)).toBe(true);
    expect(game.player.items['C-B55']?.cum.short).toBeGreaterThan(0);
  });

  it('commande forcée express : reçue la semaine suivante, +15 %', () => {
    const d0 = defaultDecision(runGame(config, { decisions: [], forced: [] }));
    const forced = [{ week: 1, item: 'R-6204', qty: 1000, express: true }];
    const before = runGame(config, { decisions: [d0], forced }, 1);
    const at1 = runGame(config, { decisions: [d0], forced }, 2);
    expect(at1.player.items['R-6204']?.pipeline.some((l) => l.qty === 1000)).toBe(true);
    const at2 = runGame(config, { decisions: [d0], forced }, 3);
    const lot = at1.player.items['R-6204']?.pipeline.find((l) => l.qty === 1000);
    expect(lot?.arrival).toBe(2);
    expect(lot?.cost).toBeCloseTo(8 * 1.15, 6);
    expect(at2.player.totals.express).toBe(1);
    expect(at1.player.totals.orders).toBeGreaterThan(before.player.totals.orders);
  });

  it('PIC : stock fin = stock début + réceptions − ventes, par famille', () => {
    const g0 = runGame(config, { decisions: [], forced: [] });
    const d0 = defaultDecision(g0);
    const g = runGame(config, { decisions: [d0], forced: [] });
    const d1 = defaultDecision(g);
    const plan = projectPlan(g, d1);
    expect(plan.months).toEqual([1, 2, 3]);
    for (const fam of NEGOCE.families) {
      let stock = NEGOCE.items
        .filter((i) => i.family === fam)
        .reduce(
          (s, i) => s + (g.player.items[i.id]?.onHand ?? 0) - (g.player.items[i.id]?.backlog ?? 0),
          0,
        );
      for (const cell of plan.families[fam] ?? []) {
        stock = stock + cell.receipts - cell.sales;
        expect(cell.stockEnd).toBeCloseTo(stock, 6);
      }
    }
    expect(plan.pallets).toHaveLength(3);
  });

  it('suggestion du lancement : estimation du commercial', () => {
    const g = runGame(config, { decisions: [], forced: [] });
    const def = NEGOCE.items.find((i) => i.id === 'F-N20')!;
    expect(suggestion(g.world, def, 5).forecast).toEqual([0, 55, 55]);
    expect(suggestion(g.world, def, 0).forecast).toEqual([0, 0, 0]);
  });

  it('fin de partie : le stock de l’article en fin de vie est déprécié à 20 %', () => {
    const { game } = playAll(config);
    expect(game.finished).toBe(true);
    const h10 = game.player.items['F-H10'];
    if (h10 && h10.onHand > 0) expect(game.player.totals.obsolescence).toBeGreaterThan(0);
  });
});

describe('sauvegarde', () => {
  const config = { ...newConfig('easy', 123456), company: 'Test', unit: 'pièces' };
  const g0 = runGame(config, { decisions: [], forced: [] });
  const save: SaveData = {
    app: SAVE_APP,
    version: 1,
    config,
    decisions: [defaultDecision(g0)],
    forced: [{ week: 2, item: 'C-B55', qty: 50, express: false }],
    week: 4,
  };

  it('aller-retour', () => {
    expect(parseSave(serialize(save))).toEqual(save);
  });

  it('refuse un fichier abîmé ou hors bornes', () => {
    expect(parseSave('{')).toBeNull();
    expect(parseSave(JSON.stringify({ ...save, app: 'autre' }))).toBeNull();
    const bad = structuredClone(save);
    (bad.decisions[0]!['R-6204'] as { service: number }).service = 120;
    expect(parseSave(JSON.stringify(bad))).toBeNull();
    const badItem = structuredClone(save);
    badItem.forced[0]!.item = 'X-1';
    expect(parseSave(JSON.stringify(badItem))).toBeNull();
    const badWeek = { ...save, week: 500 };
    expect(parseSave(JSON.stringify(badWeek))).toBeNull();
  });
});
