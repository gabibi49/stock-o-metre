/**
 * Jeu d'exemple du « Kit ordonnancement » : un petit atelier de tôlerie
 * (découpe laser, pliage, soudure), 6 OF sur une semaine.
 * Source unique pour le fichier CSV téléchargeable (FR et EN) et pour
 * l'aperçu (Gantt, charge des postes) de la page du kit.
 */
import type { Operation } from './scheduling';

/** Une semaine ouvrée de 5 jours de 8 h, du lundi 4 au vendredi 8 janvier 2027. */
export const HORIZON = {
  days: ['2027-01-04', '2027-01-05', '2027-01-06', '2027-01-07', '2027-01-08'],
  hoursPerDay: 8,
} as const;

export interface ExampleRow {
  order: string;
  item: string;
  quantity: number;
  seq: number;
  workCenter: 'DEC' | 'PLI' | 'SOU';
  setupHours: number;
  unitHours: number;
  setupFamily: string;
  earliestStart: string;
  dueDate: string;
  priority: number;
  status: 'released' | 'planned';
}

/** Libellés des postes (affichage). */
export const WORK_CENTERS = ['DEC', 'PLI', 'SOU'] as const;

const op = (
  order: string,
  item: string,
  quantity: number,
  earliestStart: string,
  dueDate: string,
  priority: number,
  status: ExampleRow['status'],
  routing: Array<[number, ExampleRow['workCenter'], number, number, string]>,
): ExampleRow[] =>
  routing.map(([seq, workCenter, setupHours, unitHours, setupFamily]) => ({
    order,
    item,
    quantity,
    seq,
    workCenter,
    setupHours,
    unitHours,
    setupFamily,
    earliestStart,
    dueDate,
    priority,
    status,
  }));

export const EXAMPLE_ROWS: ExampleRow[] = [
  ...op('OF-1001', 'SUP-A', 120, '2027-01-04', '2027-01-07', 1, 'released', [
    [10, 'DEC', 0.5, 0.02, 'TOLE-2'],
    [20, 'PLI', 0.5, 0.03, 'OUTIL-A'],
    [30, 'SOU', 0.25, 0.05, 'GAB-1'],
  ]),
  ...op('OF-1002', 'CAP-B', 60, '2027-01-04', '2027-01-06', 2, 'released', [
    [10, 'DEC', 0.5, 0.05, 'TOLE-3'],
    [20, 'PLI', 0.75, 0.06, 'OUTIL-B'],
  ]),
  ...op('OF-1003', 'CHA-C', 40, '2027-01-04', '2027-01-08', 2, 'released', [
    [10, 'DEC', 1, 0.1, 'TOLE-3'],
    [20, 'PLI', 0.5, 0.08, 'OUTIL-B'],
    [30, 'SOU', 0.5, 0.2, 'GAB-2'],
  ]),
  ...op('OF-1004', 'SUP-A', 200, '2027-01-04', '2027-01-08', 3, 'planned', [
    [10, 'DEC', 0.5, 0.02, 'TOLE-2'],
    [20, 'PLI', 0.5, 0.03, 'OUTIL-A'],
    [30, 'SOU', 0.25, 0.05, 'GAB-1'],
  ]),
  ...op('OF-1005', 'PAT-D', 500, '2027-01-05', '2027-01-07', 3, 'planned', [
    [10, 'DEC', 0.25, 0.01, 'TOLE-2'],
    [20, 'PLI', 0.25, 0.01, 'OUTIL-A'],
  ]),
  ...op('OF-1006', 'CAP-B', 80, '2027-01-05', '2027-01-08', 1, 'planned', [
    [10, 'DEC', 0.5, 0.05, 'TOLE-3'],
    [20, 'PLI', 0.75, 0.06, 'OUTIL-B'],
  ]),
];

/** Heures ouvrées écoulées au début du jour donné. */
function dayStart(date: string): number {
  const i = (HORIZON.days as readonly string[]).indexOf(date);
  if (i < 0) throw new Error(`Date hors horizon : ${date}`);
  return i * HORIZON.hoursPerDay;
}

/** Les `n` premiers jours ouvrés (lundi à vendredi) depuis le début de l'horizon, en AAAA-MM-JJ. */
export function workingDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date(`${HORIZON.days[0]}T00:00:00Z`);
  while (out.length < n) {
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

/**
 * Convertit des heures ouvrées en jour et heure (journée de 8 h à 16 h).
 * Une fin pile en fin de journée reste sur ce jour (16:00), pas sur le lendemain 8:00.
 */
export function slot(hours: number, isEnd: boolean): { date: string; time: string } {
  const h = Math.round(hours * 60) / 60;
  let day = Math.floor(h / HORIZON.hoursPerDay);
  let within = h - day * HORIZON.hoursPerDay;
  if (isEnd && within === 0 && day > 0) {
    day -= 1;
    within = HORIZON.hoursPerDay;
  }
  const minutes = Math.round((8 + within) * 60);
  const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  return { date: workingDays(day + 1)[day] as string, time };
}

/** Opérations prêtes pour le calcul (dates converties en heures ouvrées). */
export function exampleOperations(): Operation[] {
  return EXAMPLE_ROWS.map((r) => ({
    order: r.order,
    item: r.item,
    quantity: r.quantity,
    seq: r.seq,
    workCenter: r.workCenter,
    setupHours: r.setupHours,
    unitHours: r.unitHours,
    setupFamily: r.setupFamily,
    release: dayStart(r.earliestStart),
    due: dayStart(r.dueDate) + HORIZON.hoursPerDay,
    priority: r.priority,
  }));
}

/** Fichier CSV d'exemple : FR (« ; », virgule décimale, JJ/MM/AAAA) ou EN. */
export function exampleCsv(lang: 'fr' | 'en'): string {
  const fr = lang === 'fr';
  const header = fr
    ? [
        'of',
        'article',
        'quantite',
        'operation',
        'poste',
        'temps_reglage_h',
        'temps_unitaire_h',
        'famille_reglage',
        'debut_au_plus_tot',
        'date_due',
        'priorite',
        'statut',
      ]
    : [
        'work_order',
        'item',
        'quantity',
        'operation',
        'work_center',
        'setup_time_h',
        'unit_time_h',
        'setup_family',
        'earliest_start',
        'due_date',
        'priority',
        'status',
      ];
  const num = (x: number) => (fr ? String(x).replace('.', ',') : String(x));
  const date = (iso: string) => (fr ? iso.split('-').reverse().join('/') : iso);
  const status = (s: ExampleRow['status']) =>
    fr ? (s === 'released' ? 'Lancé' : 'Planifié') : s === 'released' ? 'Released' : 'Planned';
  const sep = fr ? ';' : ',';
  const lines = EXAMPLE_ROWS.map((r) =>
    [
      r.order,
      r.item,
      num(r.quantity),
      String(r.seq),
      r.workCenter,
      num(r.setupHours),
      num(r.unitHours),
      r.setupFamily,
      date(r.earliestStart),
      date(r.dueDate),
      String(r.priority),
      status(r.status),
    ].join(sep),
  );
  return '﻿' + [header.join(sep), ...lines].join('\r\n') + '\r\n';
}
