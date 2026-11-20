import { describe, expect, it } from 'vitest';
import { dayFromYmd, formatIsoDay, isoWeek, isoWeekday, isValidYmd } from '../../src/engine/dates';
import {
  analysisWindow,
  nextPeriodStart,
  periodLabel,
  periodStart,
} from '../../src/engine/periods';
import { aggregateItem } from '../../src/engine/aggregate';

const D = (iso: string): number => {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return dayFromYmd(y, m, d);
};

describe('dates', () => {
  it('jour de la semaine ISO', () => {
    expect(isoWeekday(D('1970-01-01'))).toBe(4); // jeudi
    expect(isoWeekday(D('2025-01-06'))).toBe(1); // lundi
    expect(isoWeekday(D('2025-01-05'))).toBe(7); // dimanche
  });
  it('validité des dates (années bissextiles, 31/02)', () => {
    expect(isValidYmd(2024, 2, 29)).toBe(true);
    expect(isValidYmd(2025, 2, 29)).toBe(false);
    expect(isValidYmd(2025, 2, 31)).toBe(false);
    expect(isValidYmd(1900, 2, 29)).toBe(false);
    expect(isValidYmd(2000, 2, 29)).toBe(true);
    expect(isValidYmd(2025, 13, 1)).toBe(false);
  });
  it('aller-retour numéro de jour ↔ date', () => {
    expect(formatIsoDay(D('2024-02-29'))).toBe('2024-02-29');
  });
});

describe('semaines ISO et changement d’année', () => {
  it.each([
    ['2024-12-29', 2024, 52], // dimanche
    ['2024-12-30', 2025, 1], // lundi : déjà semaine 1 de 2025
    ['2025-01-01', 2025, 1],
    ['2020-12-31', 2020, 53], // année à 53 semaines
    ['2021-01-03', 2020, 53],
    ['2021-01-04', 2021, 1],
    ['2026-01-01', 2026, 1],
    ['2027-01-01', 2026, 53],
  ])('%s → %i-S%i', (iso, year, week) => {
    expect(isoWeek(D(iso))).toEqual({ year, week });
  });

  it('début de semaine = lundi, y compris à cheval sur deux années', () => {
    expect(periodStart(D('2025-01-01'), 'week')).toBe(D('2024-12-30'));
    expect(periodLabel(D('2024-12-30'), 'week')).toBe('2025-W01');
    expect(periodLabel(D('2024-12-30'), 'week', 'S')).toBe('2025-S01');
    expect(nextPeriodStart(D('2024-12-30'), 'week')).toBe(D('2025-01-06'));
  });

  it('mois : décembre → janvier', () => {
    expect(periodStart(D('2024-12-17'), 'month')).toBe(D('2024-12-01'));
    expect(nextPeriodStart(D('2024-12-01'), 'month')).toBe(D('2025-01-01'));
    expect(periodLabel(D('2025-03-01'), 'month')).toBe('2025-03');
  });
});

describe('fenêtre d’analyse (périodes incomplètes)', () => {
  it('semaines complètes : rien n’est exclu', () => {
    // du lundi 6 janvier au dimanche 2 février 2025 : 4 semaines complètes
    const w = analysisWindow(D('2025-01-06'), D('2025-02-02'), 'week');
    expect(w.starts).toEqual([D('2025-01-06'), D('2025-01-13'), D('2025-01-20'), D('2025-01-27')]);
    expect(w.droppedFirst).toBeNull();
    expect(w.droppedLast).toBeNull();
  });

  it('mois incomplets au début et à la fin : exclus et signalés', () => {
    // 15 janvier → 10 avril 2025 : janvier et avril incomplets ; restent février et mars
    const w = analysisWindow(D('2025-01-15'), D('2025-04-10'), 'month');
    expect(w.starts).toEqual([D('2025-02-01'), D('2025-03-01')]);
    expect(w.droppedFirst).toBe(D('2025-01-01'));
    expect(w.droppedLast).toBe(D('2025-04-01'));
  });

  it('février bissextile complet', () => {
    const w = analysisWindow(D('2024-02-01'), D('2024-02-29'), 'month');
    expect(w.starts).toEqual([D('2024-02-01')]);
    expect(w.droppedLast).toBeNull();
  });

  it('février 2024 arrêté au 28 : incomplet', () => {
    const w = analysisWindow(D('2024-02-01'), D('2024-02-28'), 'month');
    expect(w.starts).toEqual([]);
    expect(w.droppedLast).toBe(D('2024-02-01'));
  });

  it('semaine en cours (fichier arrêté un mercredi) exclue', () => {
    const w = analysisWindow(D('2025-01-06'), D('2025-01-22'), 'week');
    expect(w.starts).toEqual([D('2025-01-06'), D('2025-01-13')]);
    expect(w.droppedLast).toBe(D('2025-01-20'));
  });
});

describe('agrégation de la consommation', () => {
  const w = analysisWindow(D('2025-01-06'), D('2025-02-02'), 'week');

  it('inclut les périodes sans sortie (à zéro)', () => {
    // Sorties : 7/01 → 5, 8/01 → 3, 29/01 → 4. Semaines : [8, 0, 0, 4]
    const r = aggregateItem(
      {
        firstDay: D('2025-01-07'),
        consDays: [D('2025-01-07'), D('2025-01-08'), D('2025-01-29')],
        consQty: [5, 3, 4],
      },
      w,
    );
    expect(r.demand).toEqual([8, 0, 0, 4]);
    expect(r.starts).toHaveLength(4);
  });

  it('un article apparu en cours de fichier commence à sa première période', () => {
    const r = aggregateItem(
      { firstDay: D('2025-01-22'), consDays: [D('2025-01-29')], consQty: [6] },
      w,
    );
    expect(r.starts).toEqual([D('2025-01-20'), D('2025-01-27')]);
    expect(r.demand).toEqual([0, 6]);
  });

  it('les retours nets d’une période ne rendent pas la consommation négative', () => {
    const r = aggregateItem(
      { firstDay: D('2025-01-06'), consDays: [D('2025-01-07'), D('2025-01-14')], consQty: [4, -2] },
      w,
    );
    expect(r.demand).toEqual([4, 0, 0, 0]);
  });

  it('les sorties des périodes incomplètes exclues sont ignorées', () => {
    const w2 = analysisWindow(D('2025-01-08'), D('2025-01-26'), 'week');
    // semaine du 6/01 incomplète (début 8/01) → exclue
    const r = aggregateItem(
      {
        firstDay: D('2025-01-08'),
        consDays: [D('2025-01-08'), D('2025-01-15')],
        consQty: [100, 7],
      },
      w2,
    );
    expect(r.demand).toEqual([7, 0]);
  });

  it('agrégation mensuelle sur un changement d’année', () => {
    const wm = analysisWindow(D('2024-11-01'), D('2025-02-28'), 'month');
    const r = aggregateItem(
      {
        firstDay: D('2024-11-03'),
        consDays: [D('2024-11-03'), D('2024-12-31'), D('2025-01-01'), D('2025-02-28')],
        consQty: [1, 2, 3, 4],
      },
      wm,
    );
    expect(r.demand).toEqual([1, 2, 3, 4]);
  });
});
