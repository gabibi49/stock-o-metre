import { describe, expect, it } from 'vitest';
import { EXAMPLE_ROWS, exampleCsv, exampleOperations } from '../../src/lib/kit-example';
import {
  loadByCenter,
  scheduleForward,
  summarizeOrders,
  type ScheduledOperation,
} from '../../src/lib/scheduling';

function checkFeasible(s: ScheduledOperation[]) {
  // Un poste ne traite qu'une opération à la fois.
  const byCenter = new Map<string, ScheduledOperation[]>();
  for (const x of s) byCenter.set(x.workCenter, [...(byCenter.get(x.workCenter) ?? []), x]);
  for (const list of byCenter.values()) {
    list.sort((a, b) => a.start - b.start);
    for (let i = 1; i < list.length; i++) {
      expect(list[i]!.start).toBeGreaterThanOrEqual(list[i - 1]!.end - 1e-9);
    }
  }
  // Gamme respectée et début au plus tôt respecté.
  for (const x of s) {
    expect(x.start).toBeGreaterThanOrEqual(x.release);
    for (const y of s) {
      if (y.order === x.order && y.seq < x.seq)
        expect(x.start).toBeGreaterThanOrEqual(y.end - 1e-9);
    }
  }
}

describe('ordonnancement de l’aperçu du kit', () => {
  it('sans regroupement des réglages', () => {
    const s = scheduleForward(exampleOperations());
    expect(s).toHaveLength(EXAMPLE_ROWS.length);
    checkFeasible(s);
    const late = summarizeOrders(s).filter((o) => o.late);
    expect(late.map((o) => o.order)).toEqual(['OF-1004']);
    expect(late[0]?.end).toBeCloseTo(43.45, 6);
    const load = loadByCenter(s);
    expect(load.get('DEC')).toBeCloseTo(25.65, 6);
    expect(load.get('PLI')).toBeCloseTo(29.45, 6);
    expect(load.get('SOU')).toBeCloseTo(25, 6);
  });

  it('avec regroupement des réglages : moins de réglage, même faisabilité', () => {
    const a = scheduleForward(exampleOperations());
    const b = scheduleForward(exampleOperations(), { groupSetups: true });
    checkFeasible(b);
    const setup = (s: ScheduledOperation[]) => s.reduce((t, x) => t + x.setup, 0);
    expect(setup(b)).toBeLessThan(setup(a));
    expect(Math.max(...b.map((x) => x.end))).toBeLessThan(Math.max(...a.map((x) => x.end)));
  });

  it('fichier CSV d’exemple : une ligne par opération, FR et EN', () => {
    for (const lang of ['fr', 'en'] as const) {
      const csv = exampleCsv(lang);
      expect(csv.startsWith('﻿')).toBe(true);
      const lines = csv.trim().split('\r\n');
      expect(lines).toHaveLength(EXAMPLE_ROWS.length + 1);
      const sep = lang === 'fr' ? ';' : ',';
      for (const l of lines) expect(l.split(sep)).toHaveLength(12);
    }
    expect(exampleCsv('fr')).toContain(
      'OF-1001;SUP-A;120;10;DEC;0,5;0,02;TOLE-2;04/01/2027;07/01/2027;1;Lancé',
    );
    expect(exampleCsv('en')).toContain(
      'OF-1001,SUP-A,120,10,DEC,0.5,0.02,TOLE-2,2027-01-04,2027-01-07,1,Released',
    );
  });
});
