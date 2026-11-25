import type { AlertCode, AnalysisResult, ItemOverrides, ItemResult } from '../engine/analyze';
import {
  MAX_SERVICE_LEVEL,
  MIN_SERVICE_LEVEL,
  SAFETY_METHODS,
  type SafetyMethod,
} from '../engine/safety';
import { fmt, plural } from '../i18n';
import { toCsv, type Cell } from '../lib/csvExport';
import type { ToolContext } from './context';
import { downloadBlob, el, setChildren, type Child } from './dom';
import { state, type SortKey } from './state';

interface Column {
  key: SortKey | 'edit';
  label: (ctx: ToolContext, a: AnalysisResult) => string;
  num?: boolean;
  value?: (r: ItemResult) => number | string | null;
  cell: (ctx: ToolContext, r: ItemResult) => Child | Child[];
  className?: (r: ItemResult) => string | undefined;
  /** Colonne statistique, masquée tant que « Afficher les colonnes statistiques » n'est pas coché. */
  detail?: boolean;
}

export type Status = 'order' | 'over' | 'ok' | 'unknown';
const STATUS_ORDER: Status[] = ['order', 'over', 'ok', 'unknown'];

/** Ce qu'il faut faire pour l'article, d'après son stock actuel. */
export function statusOf(r: ItemResult): Status {
  if (r.currentStock === null) return 'unknown';
  if (r.currentStock < r.policy.ropRounded) return 'order';
  if (r.gap !== null && r.gap > 0) return 'over';
  return 'ok';
}

type HelpKey = keyof ToolContext['t']['results']['help'];

const dash = (ctx: ToolContext): string => ctx.t.results.na;

function isOver(r: ItemResult, key: keyof ItemOverrides): boolean {
  return r.overridden.includes(key);
}

function ovMark(ctx: ToolContext, text: string, overridden: boolean): Child {
  return overridden
    ? el('span', { class: 'overridden', title: ctx.t.results.override }, text)
    : text;
}

const COLUMNS: Column[] = [
  {
    key: 'item',
    label: (c) => c.t.results.cols.item,
    value: (r) => r.id,
    cell: (c, r) =>
      el(
        'button',
        {
          type: 'button',
          class: 'link-button item-code',
          'data-select': r.index,
          'aria-label': fmt(c.t.results.select, { item: r.id }),
        },
        r.id,
      ),
  },
  {
    key: 'label',
    label: (c) => c.t.results.cols.label,
    value: (r) => r.label,
    cell: (_c, r) => el('span', { class: 'item-label', title: r.label }, r.label),
  },
  {
    key: 'status',
    label: (c) => c.t.results.cols.status,
    value: (r) => STATUS_ORDER.indexOf(statusOf(r)),
    cell: (c, r) => {
      const st = statusOf(r);
      return el(
        'span',
        { class: `status status-${st}`, title: c.t.results.statusHelp[st] },
        c.t.results.status[st],
      );
    },
  },
  {
    key: 'alerts',
    label: (c) => c.t.results.cols.alerts,
    value: (r) => r.alerts.length,
    cell: (c, r) => r.alerts.map((code) => alertBadge(c, code, r)),
  },
  {
    key: 'abc',
    label: (c) => c.t.results.cols.abc,
    value: (r) => r.abc,
    cell: (_c, r) => el('span', { class: `cls cls-${r.abc}` }, r.abc),
  },
  {
    key: 'xyz',
    label: (c) => c.t.results.cols.xyz,
    value: (r) => r.xyz,
    cell: (c, r) => (r.xyz ? el('span', { class: 'cls' }, r.xyz) : dash(c)),
  },
  {
    key: 'mu',
    num: true,
    detail: true,
    label: (c, a) => fmt(c.t.results.cols.mu, { period: c.t.results.periodShort[a.kind] }),
    value: (r) => r.mu,
    cell: (c, r) => c.f(r.mu, 2),
  },
  {
    key: 'sigma',
    num: true,
    detail: true,
    label: (c) => c.t.results.cols.sigma,
    value: (r) => r.sigma,
    cell: (c, r) => c.f(r.sigma, 2),
  },
  {
    key: 'cv',
    num: true,
    detail: true,
    label: (c) => c.t.results.cols.cv,
    value: (r) => r.cv,
    cell: (c, r) => (r.cv === null ? dash(c) : c.f(r.cv, 2)),
  },
  {
    key: 'ss',
    num: true,
    label: (c) => c.t.results.cols.ss,
    value: (r) => r.policy.ssRounded,
    cell: (c, r) =>
      ovMark(
        c,
        c.f(r.policy.ssRounded, 0),
        r.overridden.some((k) => k !== 'currentStock'),
      ),
  },
  {
    key: 'rop',
    num: true,
    label: (c) => c.t.results.cols.rop,
    value: (r) => r.policy.ropRounded,
    cell: (c, r) => c.f(r.policy.ropRounded, 0),
  },
  {
    key: 'target',
    num: true,
    label: (c) => c.t.results.cols.target,
    value: (r) => r.policy.targetRounded,
    cell: (c, r) => c.f(r.policy.targetRounded, 0),
  },
  {
    key: 'stock',
    num: true,
    label: (c) => c.t.results.cols.stock,
    value: (r) => r.currentStock,
    cell: (c, r) =>
      r.currentStock === null
        ? dash(c)
        : ovMark(c, c.f(r.currentStock, 2), isOver(r, 'currentStock')),
  },
  {
    key: 'gap',
    num: true,
    label: (c) => c.t.results.cols.gap,
    value: (r) => r.gap,
    cell: (c, r) => {
      if (r.gap === null) return dash(c);
      const text = `${r.gap > 0 ? '+' : ''}${c.f(r.gap, 0)}`;
      if (r.gap === 0) return text;
      return [
        el(
          'span',
          { class: 'visually-hidden' },
          `${r.gap > 0 ? c.t.results.over : c.t.results.under} `,
        ),
        text,
      ];
    },
    className: (r) =>
      r.gap === null || r.gap === 0 ? undefined : r.gap > 0 ? 'gap-over' : 'gap-under',
  },
  {
    key: 'coverage',
    num: true,
    label: (c) => c.t.results.cols.coverage,
    value: (r) => (r.currentStock === null ? null : (r.coverageDays ?? Number.POSITIVE_INFINITY)),
    cell: (c, r) =>
      r.currentStock === null
        ? dash(c)
        : r.coverageDays === null
          ? c.t.results.infinite
          : c.f(r.coverageDays, 1),
  },
  {
    key: 'edit',
    label: (c) => c.t.results.cols.edit,
    cell: (c, r) =>
      el(
        'button',
        {
          type: 'button',
          class: 'btn btn-icon',
          'data-edit': r.index,
          'aria-expanded': state.expanded === r.index ? 'true' : 'false',
          'aria-controls': `edit-${r.index}`,
          'aria-label': fmt(c.t.results.edit, { item: r.id }),
          title: fmt(c.t.results.edit, { item: r.id }),
        },
        '⚙',
      ),
  },
];

function alertBadge(ctx: ToolContext, code: AlertCode, r: ItemResult): HTMLElement {
  const a = ctx.t.results.alerts[code];
  const long = code === 'duplicates' ? `${a.long} (${r.duplicates})` : a.long;
  return el(
    'span',
    { class: 'badge', title: long },
    el('span', { 'aria-hidden': 'true' }, a.short),
    el('span', { class: 'visually-hidden' }, long),
  );
}

function compare(a: number | string | null, b: number | string | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1; // valeurs absentes toujours en fin de liste
  if (b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Articles filtrés et triés. */
export function visibleRows(a: AnalysisResult): ItemResult[] {
  const q = state.search.trim().toLowerCase();
  const col = COLUMNS.find((c) => c.key === state.sortKey);
  const rows = a.results.filter(
    (r) =>
      (state.filterAbc === '' || r.abc === state.filterAbc) &&
      (state.filterXyz === '' ||
        (state.filterXyz === '-' ? r.xyz === null : r.xyz === state.filterXyz)) &&
      (state.filterStatus === '' ||
        (state.filterStatus === 'check'
          ? r.alerts.length > 0
          : statusOf(r) === state.filterStatus)) &&
      (q === '' || r.id.toLowerCase().includes(q) || r.label.toLowerCase().includes(q)),
  );
  if (col?.value) {
    const v = col.value;
    rows.sort((x, y) => {
      const vx = v(x);
      const vy = v(y);
      if (vx === null || vy === null) return compare(vx, vy);
      return compare(vx, vy) * state.sortDir || x.index - y.index;
    });
  }
  return rows;
}

/** Colonnes affichées (les colonnes statistiques sont masquées par défaut). */
function shownColumns(): Column[] {
  return COLUMNS.filter((c) => state.showDetails || !c.detail);
}

export function renderTable(ctx: ToolContext, a: AnalysisResult): void {
  const wrap = document.getElementById('results-wrap');
  if (!wrap) return;
  const columns = shownColumns();
  const rows = visibleRows(a);
  const pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  state.page = Math.min(state.page, pages - 1);
  const start = state.page * state.pageSize;
  const pageRows = rows.slice(start, start + state.pageSize);

  const headRow = el('tr');
  for (const c of columns) {
    const label = c.label(ctx, a);
    const help = c.key in ctx.t.results.help ? ctx.t.results.help[c.key as HelpKey] : null;
    const sorted = state.sortKey === c.key;
    const th = el('th', {
      scope: 'col',
      class: c.num ? 'num' : undefined,
      'aria-sort': sorted ? (state.sortDir === 1 ? 'ascending' : 'descending') : undefined,
    });
    if (c.value) {
      th.appendChild(
        el(
          'button',
          {
            type: 'button',
            class: 'sort',
            'data-sort': c.key,
            title: help
              ? `${help} (${fmt(ctx.t.results.sortBy, { col: label })})`
              : fmt(ctx.t.results.sortBy, { col: label }),
          },
          label,
        ),
      );
    } else {
      th.appendChild(el('span', { class: 'visually-hidden' }, label));
    }
    headRow.appendChild(th);
  }

  const tbody = el('tbody');
  for (const r of pageRows) {
    const tr = el('tr', {
      class: `item-row${state.selected === r.index ? ' is-selected' : ''}`,
      'data-index': r.index,
    });
    if (state.selected === r.index) tr.setAttribute('aria-selected', 'true');
    for (const c of columns) {
      const content = c.cell(ctx, r);
      const td = el('td', {
        class: [c.num ? 'num' : '', c.className?.(r) ?? ''].join(' ').trim() || undefined,
        'data-col': c.key,
      });
      for (const node of Array.isArray(content) ? content : [content]) {
        if (node === null || node === undefined || node === false) continue;
        td.appendChild(
          typeof node === 'string' || typeof node === 'number'
            ? document.createTextNode(String(node))
            : node,
        );
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
    if (state.expanded === r.index) tbody.appendChild(editRow(ctx, r));
  }
  if (pageRows.length === 0) {
    tbody.appendChild(el('tr', {}, el('td', { colspan: columns.length }, ctx.t.results.noMatch)));
  }

  const table = el(
    'table',
    { class: 'results-table' },
    el('caption', {}, ctx.t.results.caption),
    el('thead', {}, headRow),
    tbody,
  );
  setChildren(wrap, table);

  const info = document.getElementById('pager-info');
  if (info) {
    setChildren(
      info,
      fmt(ctx.t.results.pageInfo, {
        from: rows.length === 0 ? 0 : ctx.f(start + 1, 0),
        to: ctx.f(Math.min(start + state.pageSize, rows.length), 0),
        total: ctx.f(rows.length, 0),
      }),
    );
  }
  (document.getElementById('pager-prev') as HTMLButtonElement).disabled = state.page === 0;
  (document.getElementById('pager-next') as HTMLButtonElement).disabled = state.page >= pages - 1;
}

/** Ligne de réglages propres à un article (sous la ligne de l'article). */
function editRow(ctx: ToolContext, r: ItemResult): HTMLTableRowElement {
  const t = ctx.t.results;
  const ov = state.overrides.get(r.index) ?? {};
  const g = state.params;
  const field = (
    key: keyof ItemOverrides,
    label: string,
    globalText: string,
    value: number | undefined | null,
    attrs: Record<string, string> = {},
  ) => {
    const id = `ov-${key}-${r.index}`;
    return el(
      'div',
      { class: 'field' },
      el('label', { for: id }, label),
      el('input', {
        type: 'number',
        id,
        step: 'any',
        min: '0',
        inputmode: 'decimal',
        value: value === undefined || value === null ? '' : String(value),
        placeholder: globalText,
        'data-ov': key,
        'data-index': r.index,
        ...attrs,
      }),
      el('span', { class: 'field-hint' }, fmt(t.globalValue, { value: globalText })),
    );
  };
  const methodId = `ov-method-${r.index}`;
  const methodSelect = el('select', { id: methodId, 'data-ov': 'method', 'data-index': r.index });
  methodSelect.appendChild(
    el('option', { value: '' }, fmt(t.globalValue, { value: ctx.t.params.methods[g.method] })),
  );
  for (const m of SAFETY_METHODS) {
    methodSelect.appendChild(
      el('option', { value: m, selected: ov.method === m }, ctx.t.params.methods[m]),
    );
  }
  const panel = el(
    'div',
    { class: 'edit-panel', id: `edit-${r.index}` },
    el('h3', {}, fmt(t.editTitle, { item: r.id })),
    el('p', { class: 'field-hint' }, t.editIntro),
    el(
      'div',
      { class: 'grid-fields' },
      field('leadTimeDays', ctx.t.params.lead, ctx.f(g.leadTimeDays, 2), ov.leadTimeDays),
      field('reviewDays', ctx.t.params.review, ctx.f(g.reviewDays, 2), ov.reviewDays),
      field('leadTimeSdDays', ctx.t.params.leadSd, ctx.f(g.leadTimeSdDays, 2), ov.leadTimeSdDays),
      field(
        'serviceLevel',
        t.serviceLevel,
        ctx.f(g.serviceLevels[r.abc] * 100, 2),
        ov.serviceLevel === undefined ? undefined : Math.round(ov.serviceLevel * 1e6) / 1e4,
        { min: '50', max: '99.99' },
      ),
      field('coverageDays', ctx.t.params.coverageDays, ctx.f(g.coverageDays, 2), ov.coverageDays),
      field(
        'currentStock',
        t.currentStock,
        state.dataset?.items[r.index]?.stockFromFile === null ||
          state.dataset?.items[r.index]?.stockFromFile === undefined
          ? ctx.t.results.na
          : ctx.f(state.dataset.items[r.index]?.stockFromFile as number, 2),
        ov.currentStock,
        { min: '' },
      ),
      el(
        'div',
        { class: 'field' },
        el('label', { for: methodId }, ctx.t.params.method),
        methodSelect,
      ),
    ),
    el(
      'p',
      { class: 'share-row' },
      el(
        'button',
        { type: 'button', class: 'btn btn-secondary btn-small', 'data-reset': r.index },
        t.reset,
      ),
      el(
        'button',
        {
          type: 'button',
          class: 'btn btn-small',
          'data-edit': r.index,
          'aria-controls': `edit-${r.index}`,
          'aria-expanded': 'true',
        },
        t.close,
      ),
    ),
    el('div', { role: 'alert', id: `ov-error-${r.index}`, class: 'error-text' }),
  );
  return el('tr', { class: 'edit-row' }, el('td', { colspan: shownColumns().length }, panel));
}

/** Lit un champ de réglage par article. Renvoie false si la valeur est invalide. */
export function applyOverrideInput(
  ctx: ToolContext,
  input: HTMLInputElement | HTMLSelectElement,
): boolean {
  const index = Number(input.dataset['index']);
  const key = input.dataset['ov'] as keyof ItemOverrides;
  const ov: ItemOverrides = { ...(state.overrides.get(index) ?? {}) };
  const raw = input.value.trim();
  const errorBox = document.getElementById(`ov-error-${index}`);
  const setError = (msg: string | null) => {
    if (errorBox) setChildren(errorBox, msg ?? '');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  if (key === 'method') {
    if (raw === '') delete ov.method;
    else ov.method = raw as SafetyMethod;
  } else if (raw === '') {
    delete ov[key];
  } else {
    const n = Number(raw.replace(',', '.'));
    const label = input.closest('.field')?.querySelector('label')?.textContent ?? key;
    if (!Number.isFinite(n) || (key !== 'currentStock' && n < 0)) {
      setError(fmt(ctx.t.params.invalid, { field: label, hint: ctx.t.params.hints.positive }));
      return false;
    }
    if (key === 'serviceLevel') {
      const p = n / 100;
      if (p < MIN_SERVICE_LEVEL || p > MAX_SERVICE_LEVEL) {
        setError(fmt(ctx.t.params.invalid, { field: label, hint: ctx.t.params.hints.service }));
        return false;
      }
      ov.serviceLevel = p;
    } else {
      ov[key] = n;
    }
  }
  setError(null);
  if (Object.keys(ov).length === 0) state.overrides.delete(index);
  else state.overrides.set(index, ov);
  return true;
}

export function renderCards(ctx: ToolContext, a: AnalysisResult): void {
  const box = document.getElementById('cards');
  if (!box) return;
  const t = ctx.t.results.cards;
  const res = a.results;
  const count = (c: string) => res.filter((r) => r.abc === c).length;
  const withAlerts = res.filter((r) => r.alerts.length > 0).length;
  const belowRop = res.filter((r) => statusOf(r) === 'order').length;
  const overCount = res.filter((r) => statusOf(r) === 'over').length;
  const stockKnown = res.some((r) => r.currentStock !== null);
  const useValue = a.abcBasis === 'value';
  let over = 0;
  let under = 0;
  for (const r of res) {
    const g = useValue ? r.gapValue : r.gap;
    if (g === null) continue;
    if (g > 0) over += g;
    else under -= g;
  }
  const unit = useValue ? '' : ` ${ctx.t.results.unitsSuffix}`;
  const vh = useValue ? ` ${t.valueHint}` : '';
  const stat = (label: string, value: string) =>
    el(
      'div',
      { class: 'stat' },
      el('p', { class: 'stat-label' }, label),
      el('p', { class: 'stat-value' }, value),
    );
  setChildren(
    box,
    stat(t.items, ctx.f(res.length, 0)),
    stat(t.classes, `${count('A')} / ${count('B')} / ${count('C')}`),
    stat(t.overstock + vh, `${ctx.f(over, 0)}${unit}`),
    stat(t.understock + vh, `${ctx.f(under, 0)}${unit}`),
  );
  renderTodo(ctx, { order: belowRop, over: overCount, check: withAlerts, stockKnown });
  const basis = document.getElementById('abc-basis');
  if (basis) setChildren(basis, useValue ? ctx.t.results.abcValue : ctx.t.results.abcQty);
}

/** Bandeau « À traiter » : compteurs cliquables qui filtrent le tableau. */
export function renderTodo(
  ctx: ToolContext,
  n: { order: number; over: number; check: number; stockKnown: boolean },
): void {
  const box = document.getElementById('todo');
  if (!box) return;
  const t = ctx.t.results.todo;
  const chip = (filter: string, text: string, kind: string) =>
    el(
      'button',
      {
        type: 'button',
        class: `todo-chip todo-${kind}`,
        'data-filter': filter,
        'aria-pressed': state.filterStatus === filter ? 'true' : 'false',
      },
      text,
    );
  const chips: HTMLElement[] = [];
  const count = (forms: { one: string; other: string }, value: number) =>
    plural(ctx.lang, forms, value, { count: ctx.f(value, 0) });
  if (n.stockKnown) {
    if (n.order > 0) chips.push(chip('order', count(t.order, n.order), 'order'));
    if (n.over > 0) chips.push(chip('over', count(t.over, n.over), 'over'));
  }
  if (n.check > 0) chips.push(chip('check', count(t.check, n.check), 'check'));
  if (chips.length > 0) chips.push(chip('', t.all, 'all'));
  setChildren(
    box,
    el('h3', { class: 'todo-title' }, t.title),
    chips.length ? el('div', { class: 'todo-chips' }, ...chips) : null,
    chips.length ? el('p', { class: 'field-hint' }, t.hint) : null,
    !n.stockKnown
      ? el('p', { class: 'notice notice-warn' }, t.noStock)
      : n.order === 0 && n.over === 0
        ? el('p', { class: 'field-hint' }, t.none)
        : null,
  );
}

/** Export CSV des résultats (cellules texte protégées contre l'injection de formules). */
export function exportResults(ctx: ToolContext, a: AnalysisResult): void {
  const t = ctx.t.results;
  const header: Cell[] = [
    t.cols.item,
    t.cols.label,
    t.cols.status,
    t.cols.abc,
    t.cols.xyz,
    fmt(t.cols.mu, { period: t.periodShort[a.kind] }),
    t.cols.sigma,
    t.cols.cv,
    t.cols.ss,
    t.cols.rop,
    t.cols.target,
    t.cols.stock,
    t.cols.gap,
    t.cols.coverage,
    ctx.t.params.lead,
    ctx.t.params.review,
    ctx.t.params.leadSd,
    t.serviceLevel,
    ctx.t.params.method,
    t.cols.alerts,
  ];
  const rows: Cell[][] = [header];
  for (const r of visibleRows(a)) {
    rows.push([
      r.id,
      r.label,
      t.status[statusOf(r)],
      r.abc,
      r.xyz ?? '',
      round(r.mu, 4),
      round(r.sigma, 4),
      r.cv === null ? null : round(r.cv, 4),
      r.policy.ssRounded,
      r.policy.ropRounded,
      r.policy.targetRounded,
      r.currentStock,
      r.gap,
      r.coverageDays === null ? null : round(r.coverageDays, 1),
      r.params.leadTimeDays,
      r.params.reviewDays,
      r.params.leadTimeSdDays,
      round(r.params.serviceLevel * 100, 4),
      ctx.t.params.methods[r.params.method],
      r.alerts.map((c) => t.alerts[c].long).join(' | '),
    ]);
  }
  const csv = toCsv(
    rows,
    ctx.lang === 'fr' ? { delimiter: ';', decimal: ',' } : { delimiter: ',', decimal: '.' },
  );
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), t.exportFile);
}

const round = (x: number, d: number): number => Math.round(x * 10 ** d) / 10 ** d;
