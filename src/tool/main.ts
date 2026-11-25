/**
 * Point d'entrée de l'outil (île TypeScript, sans framework).
 * Tout le traitement a lieu dans le navigateur : le fichier n'est jamais envoyé.
 */
import { guessMoveClass, type MoveClass } from '../csv/build';
import { parseDate, type DateOrder } from '../csv/dates';
import {
  ALL_FIELDS,
  autoMap,
  headerSignature,
  missingRequired,
  REQUIRED_FIELDS,
  type ColumnMapping,
  type Field,
} from '../csv/mapping';
import type { DecimalSeparator } from '../csv/numbers';
import { MAX_FILE_BYTES } from '../csv/parse';
import type { BuildReport } from '../csv/build';
import { MAX_SERVICE_LEVEL, MIN_SERVICE_LEVEL, type SafetyMethod } from '../engine/safety';
import { dayToTime } from '../engine/dates';
import { periodLabel, periodEnd, type PeriodKind } from '../engine/periods';
import type { GlobalParams } from '../engine/analyze';
import { fmt, plural } from '../i18n';
import { readConfig, type ToolContext } from './context';
import { byId, el, setChildren } from './dom';
import { renderExplain } from './explain';
import type { BuildResponse, InspectResult, LoadResult } from './protocol';
import { applyOverrideInput, exportResults, renderCards, renderTable } from './results';

const statusFilterValues = ['', 'order', 'over', 'ok', 'unknown', 'check'];
import { recompute, resetAnalysis, state } from './state';
import { loadMapping, saveMapping } from './storage';
import { CsvWorker, WorkerError } from './worker-client';

type ChartsModule = typeof import('./charts');

const ctx: ToolContext = readConfig();
const t = ctx.t;
const worker = new CsvWorker();
let chartsModule: ChartsModule | null = null;
let chartsLoading: Promise<ChartsModule> | null = null;

// ------------------------------------------------------------------ utilitaires
const show = (id: string, visible = true): void => {
  byId(id).hidden = !visible;
};

function setStep(step: 'upload' | 'mapping' | 'params' | 'results'): void {
  const order = ['upload', 'mapping', 'params', 'results'];
  const current = order.indexOf(step);
  document.querySelectorAll<HTMLLIElement>('.steps-nav li').forEach((li) => {
    const i = order.indexOf(li.dataset['step'] ?? '');
    if (i === current) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
    li.dataset['state'] = i < current ? 'done' : '';
  });
  syncStepLinks();
}

/** Les pastilles d'étape sont des liens : désactivés tant que leur section est masquée. */
function syncStepLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('.steps-nav a').forEach((a) => {
    const target = document.getElementById(a.hash.slice(1));
    const off = !target || target.hidden;
    if (off) a.setAttribute('aria-disabled', 'true');
    else a.removeAttribute('aria-disabled');
  });
}

const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function scrollToId(id: string, focus = false): void {
  const target = document.getElementById(id);
  if (!target || target.hidden) return;
  target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  if (focus) target.focus({ preventScroll: true });
}

function showError(boxId: string, messages: string[]): void {
  const box = byId(boxId);
  if (messages.length === 0) {
    setChildren(box);
    return;
  }
  setChildren(
    box,
    el('div', { class: 'notice notice-error' }, ...messages.map((m) => el('p', {}, m))),
  );
}

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1
    ? `${ctx.f(mb, 1)} ${ctx.lang === 'fr' ? 'Mo' : 'MB'}`
    : `${ctx.f(bytes / 1024, 0)} ${ctx.lang === 'fr' ? 'ko' : 'KB'}`;
}

function errorMessage(err: unknown): string {
  if (err instanceof WorkerError) {
    if (err.code === 'empty') return t.errors.empty;
    if (err.code === 'tooManyRows') return t.errors.tooManyRows;
    return fmt(t.errors.unexpected, { detail: err.detail ?? err.code });
  }
  return fmt(t.errors.unexpected, { detail: err instanceof Error ? err.message : String(err) });
}

function setProgress(phase: 'reading' | 'parsing' | 'building', fraction: number): void {
  const bar = byId<HTMLProgressElement>('upload-progress-bar');
  bar.value = Math.round(fraction * 100);
  setChildren(byId('upload-progress-label'), t.upload[phase]);
}

// ------------------------------------------------------------------ étape 1 : fichier
async function handleFile(file: Blob, name: string): Promise<void> {
  showError('upload-error', []);
  if (!/\.(csv|txt)$/i.test(name)) {
    showError('upload-error', [t.errors.badType]);
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    showError('upload-error', [fmt(t.errors.tooBig, { size: formatSize(file.size) })]);
    return;
  }
  resetAnalysis();
  ['step-mapping', 'step-params', 'step-results', 'file-summary'].forEach((id) => show(id, false));
  setStep('upload');
  show('upload-progress');
  setProgress('reading', 0);
  try {
    const load = await worker.request<LoadResult>({ type: 'load', file }, setProgress);
    state.fileName = name;
    state.load = load;
    renderFileSummary(name, file.size, load);
    await setupMapping(load);
  } catch (err) {
    showError('upload-error', [errorMessage(err)]);
  } finally {
    show('upload-progress', false);
  }
}

function renderFileSummary(name: string, size: number, load: LoadResult): void {
  setChildren(
    byId('file-summary-text'),
    fmt(t.upload.summary, {
      name,
      size: formatSize(size),
      rows: ctx.f(load.rowCount, 0),
      encoding: load.encoding.toUpperCase(),
      delimiter: t.delimiters[load.delimiter],
    }),
  );
  const width = load.header.length;
  const head = el('tr', {}, ...load.header.map((h) => el('th', { scope: 'col' }, h)));
  const body = el(
    'tbody',
    {},
    ...load.preview.map((row) =>
      el(
        'tr',
        {},
        ...Array.from({ length: width }, (_, i) => el('td', { title: row[i] ?? '' }, row[i] ?? '')),
      ),
    ),
  );
  setChildren(
    byId('preview'),
    el(
      'table',
      { class: 'preview-table' },
      el('caption', {}, t.upload.previewCaption),
      el('thead', {}, head),
      body,
    ),
  );
  const warnings = load.warnings[0];
  setChildren(
    byId('upload-status'),
    warnings
      ? el('p', { class: 'notice notice-warn' }, fmt(t.upload.warnings, { line: warnings.line }))
      : '',
  );
  show('file-summary');
}

// ------------------------------------------------------------------ étape 2 : colonnes
async function setupMapping(load: LoadResult): Promise<void> {
  const signature = headerSignature(load.header);
  const saved = loadMapping(signature);
  const validSaved =
    saved &&
    ALL_FIELDS.every(
      (f) => saved.mapping[f] === null || (saved.mapping[f] as number) < load.header.length,
    );
  state.mapping = validSaved ? { ...saved.mapping } : autoMap(load.header);
  setChildren(byId('mapping-note'), validSaved ? t.mapping.remembered : t.mapping.auto);
  renderMappingFields(load.header);
  show('step-mapping');
  show('step-params');
  setStep('mapping');
  await inspect(validSaved ? saved : null);
  byId('mapping-title').focus();
}

function renderMappingFields(header: string[]): void {
  const box = byId('mapping-fields');
  const fields = ALL_FIELDS.map((f) => {
    const id = `map-${f}`;
    const required = REQUIRED_FIELDS.includes(f);
    const select = el('select', {
      id,
      'data-field': f,
      required,
      'aria-required': required ? 'true' : undefined,
    });
    select.appendChild(el('option', { value: '' }, t.mapping.none));
    header.forEach((h, i) =>
      select.appendChild(
        el('option', { value: i, selected: state.mapping?.[f] === i }, h || `#${i + 1}`),
      ),
    );
    return el(
      'div',
      { class: 'field' },
      el(
        'label',
        { for: id },
        t.mapping.fields[f],
        ' ',
        el(
          'span',
          { class: required ? 'req' : 'opt' },
          `(${required ? t.mapping.required : t.mapping.optional})`,
        ),
      ),
      select,
    );
  });
  setChildren(box, ...fields);
}

async function inspect(saved: ReturnType<typeof loadMapping>): Promise<void> {
  const mapping = state.mapping;
  if (!mapping) return;
  const res = await worker.request<InspectResult>({ type: 'inspect', mapping });
  state.inspect = res;
  state.dateOrder = saved?.dateOrder ?? res.date.order;
  state.decimal = saved?.decimal ?? res.decimal;
  byId<HTMLSelectElement>('date-order').value = state.dateOrder;
  byId<HTMLSelectElement>('decimal').value = state.decimal;
  updateDateHint();
  const amb = byId('date-ambiguous');
  amb.hidden = !(res.date.ambiguous && !saved && res.dateExamples.length > 0);
  setChildren(amb, fmt(t.mapping.dateAmbiguous, { example: res.dateExamples[0] ?? '' }));

  // Types de mouvement
  if (res.types && mapping.type !== null) {
    const previous = state.typeRules ?? saved?.typeRules ?? {};
    const rules: Record<string, MoveClass> = {};
    for (const v of res.types.values) rules[v.value] = previous[v.value] ?? guessMoveClass(v.value);
    state.typeRules = rules;
    renderTypes(res, mapping.type);
  } else {
    state.typeRules = null;
  }
  byId('types-block').hidden = !res.types;
  byId('no-type-note').hidden = mapping.type !== null;
  byId('no-stock-note').hidden = mapping.stock !== null;
  validateMapping();
}

function renderTypes(res: InspectResult, col: number): void {
  const header = state.load?.header[col] ?? '';
  setChildren(byId('types-intro'), fmt(t.mapping.typesIntro, { col: header }));
  const tooMany = byId('types-too-many');
  tooMany.hidden = (res.types?.total ?? 0) <= (res.types?.values.length ?? 0);
  setChildren(tooMany, fmt(t.mapping.typesTooMany, { count: ctx.f(res.types?.total ?? 0, 0) }));
  const classes: MoveClass[] = ['in', 'out', 'adjust', 'ignore'];
  const rows = (res.types?.values ?? []).map((v, i) => {
    const id = `type-${i}`;
    const select = el('select', { id, 'data-type-value': v.value });
    for (const c of classes)
      select.appendChild(
        el(
          'option',
          { value: c, selected: state.typeRules?.[v.value] === c },
          t.mapping.classes[c],
        ),
      );
    return el(
      'tr',
      {},
      el(
        'th',
        { scope: 'row' },
        el('label', { for: id }, v.value === '' ? t.mapping.typesEmpty : v.value),
      ),
      el('td', { class: 'num' }, ctx.f(v.count, 0)),
      el('td', {}, select),
    );
  });
  setChildren(byId('types-body'), ...rows);
}

function updateDateHint(): void {
  const example = state.inspect?.dateExamples[0];
  const hint = byId('date-hint');
  if (!example) {
    setChildren(hint);
    return;
  }
  const day = parseDate(example, state.dateOrder);
  setChildren(
    hint,
    day === null
      ? fmt(t.mapping.dateUnreadable, { example })
      : fmt(t.mapping.dateSample, { example, parsed: ctx.formatDate(dayToTime(day)) }),
  );
}

function validateMapping(): boolean {
  const m = state.mapping;
  if (!m) return false;
  const errors: string[] = [];
  const missing = missingRequired(m);
  if (missing.length)
    errors.push(
      fmt(t.mapping.missing, { fields: missing.map((f) => t.mapping.fields[f]).join(', ') }),
    );
  const seen = new Map<number, Field>();
  for (const f of ALL_FIELDS) {
    const col = m[f];
    if (col === null) continue;
    if (seen.has(col))
      errors.push(fmt(t.mapping.duplicate, { col: state.load?.header[col] ?? String(col + 1) }));
    seen.set(col, f);
  }
  showError('mapping-error', [...new Set(errors)]);
  byId<HTMLButtonElement>('analyze-btn').disabled = errors.length > 0;
  byId('analyze-blocked').hidden = errors.length === 0;
  return errors.length === 0;
}

async function analyze(): Promise<void> {
  const m = state.mapping;
  const load = state.load;
  if (!m || !load || !validateMapping()) return;
  if (!readParams()) return;
  showError('analyze-error', []);
  show('analyze-progress');
  byId<HTMLButtonElement>('analyze-btn').disabled = true;
  try {
    const res = await worker.request<BuildResponse>({
      type: 'build',
      options: {
        mapping: m,
        dateOrder: state.dateOrder,
        decimal: state.decimal,
        typeRules: m.type === null ? null : state.typeRules,
      },
    });
    const issues = reportIssues(res.report);
    if (!res.ok) {
      showError('analyze-error', [
        res.error === 'tooManyItems' ? t.errors.tooManyItems : t.errors.noValidRows,
        ...issues,
      ]);
      return;
    }
    showError('analyze-error', []);
    saveMapping(headerSignature(load.header), {
      mapping: m,
      dateOrder: state.dateOrder,
      decimal: state.decimal,
      typeRules: m.type === null ? null : state.typeRules,
    });
    resetAnalysis();
    state.dataset = res.dataset;
    state.report = res.report;
    state.filterStatus = '';
    byId<HTMLSelectElement>('f-status').value = '';
    show('step-results');
    setStep('results');
    refresh(true);
    scrollToId('results-title', true);
  } catch (err) {
    showError('analyze-error', [errorMessage(err)]);
  } finally {
    show('analyze-progress', false);
    byId<HTMLButtonElement>('analyze-btn').disabled = false;
  }
}

function reportIssues(r: BuildReport): string[] {
  const out: string[] = [];
  const issue = (forms: { one: string; other: string }, i: BuildReport['invalidDate']) => {
    if (i)
      out.push(
        `${plural(ctx.lang, forms, i.count, { count: ctx.f(i.count, 0), line: i.firstLine, value: i.firstValue })} ${t.issues.skipped}`,
      );
  };
  issue(t.issues.invalidDate, r.invalidDate);
  issue(t.issues.invalidQty, r.invalidQty);
  issue(t.issues.emptyItem, r.emptyItem);
  if (r.invalidPrice)
    out.push(
      plural(ctx.lang, t.issues.invalidPrice, r.invalidPrice.count, {
        line: r.invalidPrice.firstLine,
        value: r.invalidPrice.firstValue,
      }),
    );
  if (r.invalidStock)
    out.push(
      plural(ctx.lang, t.issues.invalidStock, r.invalidStock.count, {
        line: r.invalidStock.firstLine,
        value: r.invalidStock.firstValue,
      }),
    );
  return out;
}

// ------------------------------------------------------------------ étape 3 : paramètres
function readParams(): GlobalParams | null {
  const errors: string[] = [];
  const num = (
    id: string,
    label: string,
    opts: { optional?: boolean; min?: number; max?: number; hint?: string } = {},
  ): number => {
    const input = byId<HTMLInputElement>(id);
    const raw = input.value.trim().replace(',', '.');
    if (raw === '' && opts.optional) {
      input.setAttribute('aria-invalid', 'false');
      return 0;
    }
    const v = Number(raw);
    const ok =
      raw !== '' &&
      Number.isFinite(v) &&
      v >= (opts.min ?? 0) &&
      (opts.max === undefined || v <= opts.max);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (!ok)
      errors.push(
        fmt(t.params.invalid, { field: label, hint: opts.hint ?? t.params.hints.positive }),
      );
    return v;
  };
  const kind = (document.querySelector<HTMLInputElement>('input[name="period"]:checked')?.value ??
    'week') as PeriodKind;
  const sl = (c: 'A' | 'B' | 'C') =>
    num(`p-sl-${c}`, fmt(t.params.classLabel, { cls: c }), {
      min: MIN_SERVICE_LEVEL * 100,
      max: MAX_SERVICE_LEVEL * 100,
      hint: t.params.hints.service,
    }) / 100;
  const params: GlobalParams = {
    kind,
    leadTimeDays: num('p-lead', t.params.lead),
    reviewDays: num('p-review', t.params.review),
    leadTimeSdDays: num('p-leadsd', t.params.leadSd, { optional: true }),
    method: byId<HTMLSelectElement>('p-method').value as SafetyMethod,
    coverageDays: num('p-coverage', t.params.coverageDays),
    serviceLevels: { A: sl('A'), B: sl('B'), C: sl('C') },
    abc: {
      a: num('p-abc-a', 'A', { min: 0.01, max: 100, hint: t.params.hints.abc }) / 100,
      b: num('p-abc-b', 'B', { max: 100, hint: t.params.hints.abc }) / 100,
    },
    xyz: { x: num('p-xyz-x', t.params.xLimit), y: num('p-xyz-y', t.params.yLimit) },
  };
  if (params.abc.a + params.abc.b > 1 + 1e-9)
    errors.push(fmt(t.params.invalid, { field: t.params.abcThresholds, hint: t.params.hints.abc }));
  if (params.xyz.x > params.xyz.y)
    errors.push(fmt(t.params.invalid, { field: t.params.xyzThresholds, hint: t.params.hints.xyz }));
  const rest = 100 - (params.abc.a + params.abc.b) * 100;
  setChildren(byId('p-abc-rest'), fmt(t.params.abcRest, { value: ctx.f(Math.max(0, rest), 2) }));
  byId('p-method-hint').hidden = !(params.method === 'demandLead' && params.leadTimeSdDays === 0);
  showError('params-error', errors);
  return errors.length ? null : params;
}

function renderReport(): void {
  const r = state.report;
  const a = state.analysis;
  if (!r || !a || !state.dataset) return;
  const lines: string[] = [
    fmt(t.report.used, { used: ctx.f(r.rowsUsed, 0), read: ctx.f(r.rowsRead, 0) }),
  ];
  if (r.rowsIgnored)
    lines.push(
      plural(ctx.lang, t.report.ignored, r.rowsIgnored, { count: ctx.f(r.rowsIgnored, 0) }),
    );
  if (r.duplicateRows)
    lines.push(
      plural(ctx.lang, t.report.duplicates, r.duplicateRows, { count: ctx.f(r.duplicateRows, 0) }),
    );
  const kind = a.kind;
  const agg = state.aggCache.get(kind);
  const starts = agg?.window.starts ?? [];
  if (starts.length === 0) lines.push(t.report.noPeriod);
  else {
    lines.push(
      fmt(t.report.periods, {
        count: starts.length,
        from: ctx.formatDate(dayToTime(starts[0] as number)),
        to: ctx.formatDate(dayToTime(periodEnd(starts[starts.length - 1] as number, kind))),
      }),
    );
  }
  if (a.droppedFirst !== null)
    lines.push(
      fmt(t.report.droppedFirst, { label: periodLabel(a.droppedFirst, kind, ctx.weekPrefix) }),
    );
  if (a.droppedLast !== null)
    lines.push(
      fmt(t.report.droppedLast, { label: periodLabel(a.droppedLast, kind, ctx.weekPrefix) }),
    );
  const issues = reportIssues(r);
  setChildren(byId('report'), el('ul', {}, ...[...lines, ...issues].map((l) => el('li', {}, l))));
  // Le détail de lecture reste replié, sauf s'il signale des lignes illisibles.
  const box = byId('report').closest('details');
  if (box) box.open = issues.length > 0;
}

function renderParamsRecap(p: GlobalParams): void {
  setChildren(
    byId('params-recap'),
    fmt(t.params.recap, {
      lead: ctx.f(p.leadTimeDays, 2),
      review: ctx.f(p.reviewDays, 2),
      a: ctx.f(p.serviceLevels.A * 100, 2),
      b: ctx.f(p.serviceLevels.B * 100, 2),
      c: ctx.f(p.serviceLevels.C * 100, 2),
      period: t.params.periods[p.kind].toLowerCase(),
    }),
  );
}

// ------------------------------------------------------------------ étape 4 : résultats
function refresh(first = false): void {
  const params = readParams();
  if (!params) return;
  state.params = params;
  const a = recompute();
  if (!a) return;
  if (first || state.selected === null || state.selected >= a.results.length) {
    // Sélection par défaut : l'article de plus forte valeur (premier du Pareto).
    state.selected = a.pareto[0]?.index ?? null;
  }
  renderReport();
  renderParamsRecap(params);
  renderCards(ctx, a);
  renderTable(ctx, a);
  void updateCharts(first);
}

function loadCharts(): Promise<ChartsModule> {
  if (chartsModule) return Promise.resolve(chartsModule);
  chartsLoading ??= import('./charts').then((m) => (chartsModule = m));
  return chartsLoading;
}

async function updateCharts(global = true): Promise<void> {
  const a = state.analysis;
  const ds = state.dataset;
  if (!a || !ds) return;
  const charts = await loadCharts();
  const r = state.selected === null ? null : (a.results[state.selected] ?? null);
  const item = state.selected === null ? null : (ds.items[state.selected] ?? null);
  if (r && item) {
    setChildren(
      byId('chart-stock-title'),
      fmt(t.charts.stockTitle, { item: r.label ? `${r.id} — ${r.label}` : r.id }),
    );
    setChildren(
      byId('chart-cons-title'),
      fmt(t.charts.consTitle, { period: t.charts.periodWord[a.kind], item: r.id }),
    );
    charts.renderStockChart(ctx, r, item, ds.fileFirstDay, ds.fileLastDay);
    charts.renderConsumptionChart(ctx, r, a.kind);
  }
  if (global || !charts.hasChart('chart-pareto')) charts.renderGlobalCharts(ctx, a);
  renderExplain(ctx, a, r);
}

function selectItem(index: number): void {
  state.selected = index;
  const a = state.analysis;
  if (!a) return;
  renderTable(ctx, a);
  // Les graphiques sont sous le tableau : on y amène le visiteur.
  void updateCharts(false).then(() => scrollToId('chart-stock-title'));
}

function setStatusFilter(value: string): void {
  state.filterStatus = statusFilterValues.includes(value) ? value : '';
  byId<HTMLSelectElement>('f-status').value = state.filterStatus;
  state.page = 0;
  const a = state.analysis;
  if (!a) return;
  renderCards(ctx, a);
  renderTable(ctx, a);
}

// ------------------------------------------------------------------ événements
function bind(): void {
  const input = byId<HTMLInputElement>('file-input');
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) void handleFile(file, file.name);
    input.value = '';
  });

  const zone = byId('dropzone');
  const stop = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  ['dragenter', 'dragover'].forEach((type) =>
    zone.addEventListener(type, (e) => {
      stop(e);
      zone.classList.add('is-over');
    }),
  );
  ['dragleave', 'dragend'].forEach((type) =>
    zone.addEventListener(type, () => zone.classList.remove('is-over')),
  );
  zone.addEventListener('drop', (e) => {
    stop(e);
    zone.classList.remove('is-over');
    const file = (e as DragEvent).dataTransfer?.files[0];
    if (file) void handleFile(file, file.name);
  });
  // Un fichier lâché hors de la zone ne doit pas faire naviguer le navigateur vers lui.
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  const loadExample = async () => {
    try {
      const res = await fetch(ctx.exampleUrl, { credentials: 'omit' });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      await handleFile(blob, ctx.exampleUrl.split('/').pop() ?? 'exemple.csv');
    } catch {
      showError('upload-error', [t.errors.example]);
    }
  };
  byId('example-btn').addEventListener('click', () => void loadExample());
  document.querySelectorAll<HTMLButtonElement>('[data-example]').forEach((b) =>
    b.addEventListener('click', () => {
      void loadExample().then(() => scrollToId('mapping-title', true));
    }),
  );

  document.querySelector('.steps-nav')?.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a');
    if (!link) return;
    e.preventDefault();
    if (link.getAttribute('aria-disabled') === 'true') return;
    scrollToId(link.hash.slice(1));
  });

  byId('mapping-fields').addEventListener('change', (e) => {
    const sel = e.target as HTMLSelectElement;
    const field = sel.dataset['field'] as Field | undefined;
    if (!field || !state.mapping) return;
    state.mapping = {
      ...state.mapping,
      [field]: sel.value === '' ? null : Number(sel.value),
    } as ColumnMapping;
    if (field === 'type') state.typeRules = null;
    void inspect(null);
  });
  byId<HTMLSelectElement>('date-order').addEventListener('change', (e) => {
    state.dateOrder = (e.target as HTMLSelectElement).value as DateOrder;
    byId('date-ambiguous').hidden = true;
    updateDateHint();
  });
  byId<HTMLSelectElement>('decimal').addEventListener('change', (e) => {
    state.decimal = (e.target as HTMLSelectElement).value as DecimalSeparator;
  });
  byId('types-body').addEventListener('change', (e) => {
    const sel = e.target as HTMLSelectElement;
    const value = sel.dataset['typeValue'];
    if (value !== undefined && state.typeRules) state.typeRules[value] = sel.value as MoveClass;
  });
  byId('analyze-btn').addEventListener('click', () => void analyze());

  const form = byId<HTMLFormElement>('params-form');
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('change', () => {
    if (state.dataset) refresh();
  });

  const resetPage = () => {
    state.page = 0;
    if (state.analysis) renderTable(ctx, state.analysis);
  };
  byId<HTMLInputElement>('f-search').addEventListener('input', (e) => {
    state.search = (e.target as HTMLInputElement).value;
    resetPage();
  });
  byId<HTMLSelectElement>('f-abc').addEventListener('change', (e) => {
    state.filterAbc = (e.target as HTMLSelectElement).value;
    resetPage();
  });
  byId<HTMLSelectElement>('f-xyz').addEventListener('change', (e) => {
    state.filterXyz = (e.target as HTMLSelectElement).value;
    resetPage();
  });
  byId<HTMLSelectElement>('f-status').addEventListener('change', (e) => {
    setStatusFilter((e.target as HTMLSelectElement).value);
  });
  byId('todo').addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-filter]');
    if (!chip) return;
    setStatusFilter(chip.dataset['filter'] ?? '');
    byId('todo')
      .querySelector<HTMLButtonElement>(`button[data-filter="${state.filterStatus}"]`)
      ?.focus();
  });
  byId<HTMLInputElement>('f-details').addEventListener('change', (e) => {
    state.showDetails = (e.target as HTMLInputElement).checked;
    if (state.analysis) renderTable(ctx, state.analysis);
  });
  byId<HTMLSelectElement>('f-size').addEventListener('change', (e) => {
    state.pageSize = Number((e.target as HTMLSelectElement).value);
    resetPage();
  });
  byId('pager-prev').addEventListener('click', () => {
    state.page = Math.max(0, state.page - 1);
    if (state.analysis) renderTable(ctx, state.analysis);
  });
  byId('pager-next').addEventListener('click', () => {
    state.page += 1;
    if (state.analysis) renderTable(ctx, state.analysis);
  });

  const wrap = byId('results-wrap');
  wrap.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const a = state.analysis;
    if (!a) return;
    const sortBtn = target.closest<HTMLButtonElement>('button[data-sort]');
    if (sortBtn) {
      const key = sortBtn.dataset['sort'] as typeof state.sortKey;
      state.sortDir = state.sortKey === key ? (state.sortDir === 1 ? -1 : 1) : 1;
      state.sortKey = key;
      renderTable(ctx, a);
      wrap.querySelector<HTMLButtonElement>(`button[data-sort="${key}"]`)?.focus();
      return;
    }
    const editBtn = target.closest<HTMLButtonElement>('button[data-edit]');
    if (editBtn) {
      const index = Number(editBtn.dataset['edit']);
      state.expanded = state.expanded === index ? null : index;
      renderTable(ctx, a);
      const focusSel =
        state.expanded === null
          ? `button.btn-icon[data-edit="${index}"]`
          : `#ov-leadTimeDays-${index}`;
      wrap.querySelector<HTMLElement>(focusSel)?.focus();
      return;
    }
    const resetBtn = target.closest<HTMLButtonElement>('button[data-reset]');
    if (resetBtn) {
      const index = Number(resetBtn.dataset['reset']);
      state.overrides.delete(index);
      refresh();
      wrap.querySelector<HTMLElement>(`#ov-leadTimeDays-${index}`)?.focus();
      return;
    }
    if (target.closest('.edit-row, input, select')) return;
    const row = target.closest<HTMLTableRowElement>('tr.item-row');
    if (row) selectItem(Number(row.dataset['index']));
  });
  wrap.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement | HTMLSelectElement;
    if (!input.dataset['ov']) return;
    const id = input.id;
    if (applyOverrideInput(ctx, input)) {
      refresh();
      document.getElementById(id)?.focus();
    }
  });

  byId('export-csv').addEventListener('click', () => {
    if (state.analysis) exportResults(ctx, state.analysis);
  });

  byId('charts').addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-download]');
    if (!btn) return;
    const charts = await loadCharts();
    const id = btn.dataset['download'] as string;
    const sel = state.selected !== null ? state.analysis?.results[state.selected]?.id : undefined;
    const safe = (sel ?? '').replace(/[^\w.-]+/g, '_').slice(0, 40);
    await charts.downloadChartPng(
      id,
      `stock-o-metre-${id.replace('chart-', '')}${safe && /stock|cons/.test(id) ? `-${safe}` : ''}.png`,
      ctx.watermark,
    );
  });

  const copy = byId<HTMLButtonElement>('share-copy');
  copy.addEventListener('click', async () => {
    const url = copy.dataset['url'] ?? ctx.homeUrl;
    try {
      await navigator.clipboard.writeText(url);
      setChildren(byId('share-status'), t.share.copied);
    } catch {
      setChildren(byId('share-status'), url);
    }
  });
}

bind();
// Indique aux tests de bout en bout que l'outil est prêt.
document.documentElement.dataset['toolReady'] = 'true';

// Précharge le module des graphiques quand le navigateur est inactif, quelques
// secondes après l'affichage : la page s'ouvre vite, et l'outil reste ensuite
// entièrement utilisable même si la connexion est coupée.
window.addEventListener('load', () => {
  setTimeout(() => {
    const preload = () => void loadCharts().catch(() => undefined);
    if ('requestIdleCallback' in window) window.requestIdleCallback(preload, { timeout: 5000 });
    else preload();
  }, 3000);
});
