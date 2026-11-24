/**
 * Ordonnancement simplifié, à capacité finie, utilisé pour l'aperçu de la page
 * « Kit ordonnancement » (calculé au build, rien n'est exécuté chez le visiteur).
 *
 * Modèle : chaque opération d'un OF passe sur un poste, après l'opération
 * précédente du même OF. Un poste ne traite qu'une opération à la fois.
 * Règle de choix (liste) : à chaque pas, on planifie l'opération qui peut
 * commencer le plus tôt ; à égalité, la priorité la plus forte (1), puis la
 * date due la plus proche, puis le numéro d'OF.
 * Le temps est compté en heures ouvrées depuis le début de l'horizon.
 */

export interface Operation {
  order: string;
  item: string;
  quantity: number;
  /** Numéro d'opération (10, 20, 30…) : ordre de passage dans l'OF. */
  seq: number;
  workCenter: string;
  setupHours: number;
  unitHours: number;
  /** Famille de réglage : deux opérations successives de même famille sur un poste évitent le réglage (option). */
  setupFamily: string;
  /** Début au plus tôt, en heures ouvrées depuis le début de l'horizon. */
  release: number;
  /** Date due (fin de journée), en heures ouvrées depuis le début de l'horizon. */
  due: number;
  /** 1 = la plus urgente. */
  priority: number;
}

export interface ScheduledOperation extends Operation {
  start: number;
  end: number;
  /** Temps de réglage réellement compté. */
  setup: number;
}

export interface ScheduleOptions {
  /** Supprimer le réglage quand l'opération précédente du poste a la même famille. */
  groupSetups?: boolean;
}

export function operationHours(op: Operation, setup = op.setupHours): number {
  return setup + op.quantity * op.unitHours;
}

export function scheduleForward(
  ops: readonly Operation[],
  options: ScheduleOptions = {},
): ScheduledOperation[] {
  const pending = [...ops];
  const done: ScheduledOperation[] = [];
  const centerFree = new Map<string, number>();
  const centerFamily = new Map<string, string>();
  const orderEnd = new Map<string, { seq: number; end: number }>();

  const predecessorDone = (op: Operation) =>
    !pending.some((o) => o.order === op.order && o.seq < op.seq);

  while (pending.length > 0) {
    let best: { op: Operation; est: number } | null = null;
    for (const op of pending) {
      if (!predecessorDone(op)) continue;
      const prev = orderEnd.get(op.order);
      const est = Math.max(op.release, prev?.end ?? 0, centerFree.get(op.workCenter) ?? 0);
      if (
        best === null ||
        est < best.est - 1e-9 ||
        (Math.abs(est - best.est) <= 1e-9 &&
          (op.priority - best.op.priority ||
            op.due - best.op.due ||
            op.order.localeCompare(best.op.order)) < 0)
      ) {
        best = { op, est };
      }
    }
    if (best === null) throw new Error('Gamme incohérente : aucune opération planifiable');
    const { op, est } = best;
    const sameFamily = options.groupSetups && centerFamily.get(op.workCenter) === op.setupFamily;
    const setup = sameFamily ? 0 : op.setupHours;
    const end = est + operationHours(op, setup);
    done.push({ ...op, start: est, end, setup });
    centerFree.set(op.workCenter, end);
    centerFamily.set(op.workCenter, op.setupFamily);
    orderEnd.set(op.order, { seq: op.seq, end });
    pending.splice(pending.indexOf(op), 1);
  }
  return done;
}

export interface OrderSummary {
  order: string;
  item: string;
  end: number;
  due: number;
  late: boolean;
}

/** Date de fin de chaque OF et retard éventuel. */
export function summarizeOrders(schedule: readonly ScheduledOperation[]): OrderSummary[] {
  const byOrder = new Map<string, OrderSummary>();
  for (const s of schedule) {
    const cur = byOrder.get(s.order);
    if (!cur || s.end > cur.end) {
      byOrder.set(s.order, {
        order: s.order,
        item: s.item,
        end: s.end,
        due: s.due,
        late: s.end > s.due + 1e-9,
      });
    }
  }
  return [...byOrder.values()].sort((a, b) => a.order.localeCompare(b.order));
}

/** Charge totale (heures) par poste. */
export function loadByCenter(schedule: readonly ScheduledOperation[]): Map<string, number> {
  const load = new Map<string, number>();
  for (const s of schedule) load.set(s.workCenter, (load.get(s.workCenter) ?? 0) + s.end - s.start);
  return load;
}
