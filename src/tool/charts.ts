/**
 * Graphiques (Apache ECharts, import modulaire : seuls les modules utilisés sont
 * empaquetés). Ce module est chargé à la demande, après le premier calcul.
 *
 * Sécurité : les info-bulles sont construites en éléments DOM (textContent),
 * jamais en chaîne HTML ; aucun texte du fichier n'est interprété.
 */
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { AnalysisResult, ItemResult } from '../engine/analyze';
import { dayToTime } from '../engine/dates';
import { periodLabel } from '../engine/periods';
import { replayStock, stockoutIntervals } from '../engine/replay';
import type { ItemData } from '../engine/types';
import { fmt } from '../i18n';
import type { ToolContext } from './context';
import { downloadBlob, el, setChildren } from './dom';

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkAreaComponent,
  LegendComponent,
  CanvasRenderer,
]);

/** Palette Okabe-Ito (lisible par les personnes daltoniennes). */
const C = {
  blue: '#0072B2',
  sky: '#56B4E9',
  orange: '#E69F00',
  green: '#009E73',
  vermillion: '#D55E00',
  purple: '#CC79A7',
  grey: '#5b6672',
  stockout: 'rgba(213, 94, 0, 0.14)',
  band: 'rgba(0, 114, 178, 0.10)',
};

const TEXT = {
  color: '#17212b',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
};
const AXIS_LABEL = { color: '#4f5b67', fontSize: 11 };
const SPLIT = { lineStyle: { color: '#e3e7ec' } };

type Chart = echarts.ECharts;
const charts = new Map<string, Chart>();

function chartFor(id: string): Chart {
  const existing = charts.get(id);
  if (existing) return existing;
  const node = document.getElementById(id) as HTMLDivElement;
  const chart = echarts.init(node, undefined, { renderer: 'canvas' });
  charts.set(id, chart);
  new ResizeObserver(() => chart.resize()).observe(node);
  return chart;
}

interface TipRow {
  color?: string;
  label: string;
  value: string;
}

/** Info-bulle en éléments DOM (aucune chaîne HTML). */
function tooltip(title: string, rows: TipRow[]): HTMLElement {
  const box = el('div', { class: 'tip' }, el('strong', {}, title));
  for (const r of rows) {
    const swatch = el('span', { class: 'tip-swatch' });
    if (r.color) swatch.style.backgroundColor = r.color;
    box.appendChild(el('div', { class: 'tip-row' }, swatch, `${r.label} : `, el('b', {}, r.value)));
  }
  return box;
}

interface AxisParam {
  axisValue?: string | number;
  seriesName?: string;
  value?: unknown;
  color?: unknown;
  dataIndex: number;
}

const baseOption = (): echarts.EChartsCoreOption => ({
  animation: false,
  textStyle: TEXT,
  grid: { left: 56, right: 20, top: 40, bottom: 56, containLabel: false },
  legend: { top: 0, textStyle: { color: TEXT.color, fontSize: 12 }, itemWidth: 18 },
  tooltip: {
    trigger: 'axis',
    confine: true,
    backgroundColor: '#ffffff',
    borderColor: '#b7c0cc',
    textStyle: { color: TEXT.color, fontSize: 12 },
  },
});

// ---------------------------------------------------------------- Graphique 1
export function renderStockChart(
  ctx: ToolContext,
  r: ItemResult,
  item: ItemData,
  fileFirst: number,
  fileLast: number,
): void {
  const t = ctx.t.charts;
  const f = ctx.f;
  const series = replayStock(item.moveDays, item.moveNets, r.currentStock, fileFirst, fileLast);
  const outs = stockoutIntervals(series);
  const data = series.days.map((d, i) => [dayToTime(d), series.stock[i] as number]);
  const chart = chartFor('chart-stock');
  const line = (
    name: string,
    value: number,
    color: string,
    type: 'solid' | 'dashed' | 'dotted',
  ) => ({
    name,
    type: 'line',
    data: [],
    color,
    markLine: {
      silent: true,
      symbol: 'none',
      label: { show: false },
      lineStyle: { color, type, width: 2 },
      data: [{ yAxis: value }],
    },
  });
  chart.setOption(
    {
      ...baseOption(),
      grid: { left: 60, right: 20, top: 40, bottom: 80 },
      xAxis: { type: 'time', axisLabel: AXIS_LABEL, splitLine: { show: false } },
      yAxis: {
        type: 'value',
        axisLabel: { ...AXIS_LABEL, formatter: (v: number) => f(v, 0) },
        splitLine: SPLIT,
      },
      dataZoom: [
        { type: 'inside', filterMode: 'none' },
        { type: 'slider', filterMode: 'none', height: 22, bottom: 16, labelFormatter: '' },
      ],
      tooltip: {
        ...(baseOption()['tooltip'] as object),
        formatter: (params: unknown) => {
          const p = (params as AxisParam[])[0];
          if (!p) return '';
          const [time, value] = p.value as [number, number];
          return tooltip(ctx.formatDate(time), [
            { color: C.blue, label: t.stock, value: f(value, 2) },
          ]);
        },
      },
      series: [
        {
          name: t.stock,
          type: 'line',
          step: 'end',
          showSymbol: false,
          data,
          color: C.blue,
          lineStyle: { width: 2 },
          markArea: {
            silent: true,
            itemStyle: { color: C.stockout },
            data: outs.map(([a, b]) => [{ xAxis: dayToTime(a) }, { xAxis: dayToTime(b) }]),
          },
        },
        line(t.ss, r.policy.ss, C.vermillion, 'dashed'),
        line(t.rop, r.policy.rop, C.orange, 'dotted'),
        line(t.target, r.policy.target, C.green, 'solid'),
        // Série fictive : entrée de légende pour les zones de rupture.
        {
          name: t.stockout,
          type: 'line',
          data: [],
          color: C.vermillion,
          lineStyle: { opacity: 0 },
          symbol: 'rect',
        },
      ],
    },
    { notMerge: true },
  );
  const min = Math.min(...series.stock);
  const max = Math.max(...series.stock);
  setText(
    'chart-stock-summary',
    fmt(t.stockSummary, {
      from: ctx.formatDate(dayToTime(fileFirst)),
      to: ctx.formatDate(dayToTime(fileLast)),
      item: r.id,
      min: f(min, 0),
      max: f(max, 0),
      stockouts: outs.length,
      ss: f(r.policy.ssRounded, 0),
      rop: f(r.policy.ropRounded, 0),
      target: f(r.policy.targetRounded, 0),
    }),
  );
  const note = document.getElementById('chart-stock-note');
  if (note) note.hidden = series.absolute;
}

// ---------------------------------------------------------------- Graphique 2
export function renderConsumptionChart(
  ctx: ToolContext,
  r: ItemResult,
  kind: AnalysisResult['kind'],
): void {
  const t = ctx.t.charts;
  const f = ctx.f;
  const labels = r.periodStarts.map((s) => periodLabel(s, kind, ctx.weekPrefix));
  const lo = Math.max(0, r.mu - r.sigma);
  const hi = r.mu + r.sigma;
  const chart = chartFor('chart-cons');
  chart.setOption(
    {
      ...baseOption(),
      grid: { left: 56, right: 20, top: 40, bottom: 80 },
      xAxis: { type: 'category', data: labels, axisLabel: AXIS_LABEL },
      yAxis: {
        type: 'value',
        axisLabel: { ...AXIS_LABEL, formatter: (v: number) => f(v, 0) },
        splitLine: SPLIT,
      },
      dataZoom: [
        { type: 'inside' },
        { type: 'slider', height: 22, bottom: 16, labelFormatter: '' },
      ],
      tooltip: {
        ...(baseOption()['tooltip'] as object),
        formatter: (params: unknown) => {
          const p = (params as AxisParam[])[0];
          if (!p) return '';
          return tooltip(String(p.axisValue ?? ''), [
            { color: C.sky, label: t.consumption, value: f(Number(p.value), 2) },
            { color: C.blue, label: t.mean, value: f(r.mu, 2) },
          ]);
        },
      },
      series: [
        {
          name: t.consumption,
          type: 'bar',
          data: r.demand,
          color: C.sky,
          barMaxWidth: 18,
          markArea: {
            silent: true,
            itemStyle: { color: C.band },
            data: [[{ yAxis: lo }, { yAxis: hi }]],
          },
          markLine: {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: C.blue, width: 2, type: 'solid' },
            data: [{ yAxis: r.mu }],
          },
        },
        { name: t.mean, type: 'line', data: [], color: C.blue },
        {
          name: t.band,
          type: 'line',
          data: [],
          color: 'rgba(0, 114, 178, 0.35)',
          lineStyle: { width: 8 },
        },
      ],
    },
    { notMerge: true },
  );
  const zeros = r.demand.filter((d) => d === 0).length;
  setText(
    'chart-cons-summary',
    fmt(t.consSummary, {
      n: r.n,
      mu: f(r.mu, 2),
      sigma: f(r.sigma, 2),
      min: f(r.demand.length ? Math.min(...r.demand) : 0, 2),
      max: f(r.demand.length ? Math.max(...r.demand) : 0, 2),
      zeros,
    }),
  );
}

// ---------------------------------------------------------------- Graphique 3
export function renderGlobalCharts(ctx: ToolContext, a: AnalysisResult): void {
  const t = ctx.t.charts;
  const f = ctx.f;
  const pct = (x: number) => ctx.pct(x);

  // Pareto
  const total = a.pareto.reduce((s, e) => s + e.value, 0);
  const pareto = chartFor('chart-pareto');
  const ids = a.pareto.map((e) => a.results[e.index]?.id ?? '');
  pareto.setOption(
    {
      ...baseOption(),
      grid: { left: 56, right: 56, top: 40, bottom: 48 },
      xAxis: { type: 'category', data: ids, axisLabel: { ...AXIS_LABEL, hideOverlap: true } },
      yAxis: [
        {
          type: 'value',
          name: a.abcBasis === 'value' ? t.paretoValue : t.paretoQty,
          nameTextStyle: AXIS_LABEL,
          axisLabel: { ...AXIS_LABEL, formatter: (v: number) => f(v, 0) },
          splitLine: SPLIT,
        },
        {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: { ...AXIS_LABEL, formatter: (v: number) => `${v}%` },
          splitLine: { show: false },
        },
      ],
      dataZoom: a.pareto.length > 60 ? [{ type: 'inside' }] : [],
      tooltip: {
        ...(baseOption()['tooltip'] as object),
        formatter: (params: unknown) => {
          const ps = params as AxisParam[];
          const p = ps[0];
          if (!p) return '';
          const e = a.pareto[p.dataIndex];
          if (!e) return '';
          const r = a.results[e.index];
          return tooltip(`${r?.id ?? ''} (${e.abc})`, [
            {
              color: C.sky,
              label: a.abcBasis === 'value' ? t.paretoValue : t.paretoQty,
              value: f(e.value, 0),
            },
            { color: C.blue, label: t.paretoShare, value: pct(e.cumulativeShare) },
          ]);
        },
      },
      series: [
        {
          name: a.abcBasis === 'value' ? t.paretoValue : t.paretoQty,
          type: 'bar',
          data: a.pareto.map((e) => ({
            value: e.value,
            itemStyle: { color: e.abc === 'A' ? C.blue : e.abc === 'B' ? C.sky : '#b9c3cf' },
          })),
          barCategoryGap: '10%',
        },
        {
          name: t.paretoShare,
          type: 'line',
          yAxisIndex: 1,
          showSymbol: false,
          color: C.orange,
          lineStyle: { width: 2 },
          data: a.pareto.map((e) => Math.round(e.cumulativeShare * 10000) / 100),
        },
      ],
    },
    { notMerge: true },
  );
  const count = (c: string) => a.results.filter((r) => r.abc === c).length;
  const aShare = a.pareto.filter((e) => e.abc === 'A').reduce((s, e) => s + e.value, 0);
  setText(
    'chart-pareto-summary',
    fmt(t.paretoSummary, {
      a: count('A'),
      b: count('B'),
      c: count('C'),
      aShare: pct(total > 0 ? aShare / total : 0),
    }),
  );

  // Barres par classe
  const useValue = a.abcBasis === 'value';
  const known = a.results.filter((r) => r.currentStock !== null);
  const classes = ['A', 'B', 'C'] as const;
  const val = (r: ItemResult, q: number) => (useValue ? q * (r.price ?? 0) : q);
  const cur = classes.map((c) =>
    known.filter((r) => r.abc === c).reduce((s, r) => s + val(r, r.currentStock as number), 0),
  );
  const tgt = classes.map((c) =>
    known.filter((r) => r.abc === c).reduce((s, r) => s + val(r, r.policy.targetRounded), 0),
  );
  const byClass = chartFor('chart-class');
  byClass.setOption(
    {
      ...baseOption(),
      grid: { left: 64, right: 20, top: 40, bottom: 32 },
      xAxis: {
        type: 'category',
        data: classes.map((c) => fmt(ctx.t.params.classLabel, { cls: c })),
        axisLabel: AXIS_LABEL,
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...AXIS_LABEL, formatter: (v: number) => f(v, 0) },
        splitLine: SPLIT,
      },
      tooltip: {
        ...(baseOption()['tooltip'] as object),
        formatter: (params: unknown) => {
          const ps = params as AxisParam[];
          const p = ps[0];
          if (!p) return '';
          return tooltip(String(p.axisValue ?? ''), [
            { color: C.blue, label: t.current, value: f(cur[p.dataIndex] ?? 0, 0) },
            { color: C.green, label: t.targetStock, value: f(tgt[p.dataIndex] ?? 0, 0) },
          ]);
        },
      },
      series: [
        { name: t.current, type: 'bar', data: cur, color: C.blue, barMaxWidth: 48 },
        { name: t.targetStock, type: 'bar', data: tgt, color: C.green, barMaxWidth: 48 },
      ],
    },
    { notMerge: true },
  );
  setText(
    'chart-class-summary',
    known.length === 0
      ? t.classNone
      : fmt(t.classSummary, {
          details: classes
            .map((c, i) => `${c} ${f(cur[i] ?? 0, 0)} / ${f(tgt[i] ?? 0, 0)}`)
            .join(' ; '),
        }),
  );

  // 20 plus gros surstocks
  const over = known
    .map((r) => ({ r, gap: useValue ? (r.gapValue ?? 0) : (r.gap ?? 0) }))
    .filter((x) => x.gap > 0)
    .sort((x, y) => y.gap - x.gap)
    .slice(0, 20);
  setText('chart-top-title', fmt(t.topTitle, { basis: useValue ? t.basisValue : t.basisQty }));
  const top = chartFor('chart-top');
  const topIds = over.map((x) => x.r.id).reverse();
  const topCur = over.map((x) => val(x.r, x.r.currentStock as number)).reverse();
  const topTgt = over.map((x) => val(x.r, x.r.policy.targetRounded)).reverse();
  top.setOption(
    {
      ...baseOption(),
      grid: { left: 90, right: 24, top: 40, bottom: 28 },
      yAxis: {
        type: 'category',
        data: topIds,
        axisLabel: { ...AXIS_LABEL, width: 80, overflow: 'truncate' },
      },
      xAxis: {
        type: 'value',
        axisLabel: { ...AXIS_LABEL, formatter: (v: number) => f(v, 0) },
        splitLine: SPLIT,
      },
      tooltip: {
        ...(baseOption()['tooltip'] as object),
        formatter: (params: unknown) => {
          const ps = params as AxisParam[];
          const p = ps[0];
          if (!p) return '';
          return tooltip(String(p.axisValue ?? ''), [
            { color: C.blue, label: t.current, value: f(topCur[p.dataIndex] ?? 0, 0) },
            { color: C.green, label: t.targetStock, value: f(topTgt[p.dataIndex] ?? 0, 0) },
          ]);
        },
      },
      series: [
        { name: t.current, type: 'bar', data: topCur, color: C.blue, barMaxWidth: 14 },
        { name: t.targetStock, type: 'bar', data: topTgt, color: C.green, barMaxWidth: 14 },
      ],
    },
    { notMerge: true },
  );
  setText(
    'chart-top-summary',
    over.length === 0
      ? t.topNone
      : fmt(t.topSummary, {
          details: over
            .slice(0, 5)
            .map((x) => `${x.r.id} (+${f(x.gap, 0)})`)
            .join(', '),
        }),
  );
}

function setText(id: string, text: string): void {
  const node = document.getElementById(id);
  if (node) setChildren(node, text);
}

/**
 * Export PNG d'un graphique avec un discret filigrane portant l'adresse du site.
 * Tout est fait localement (canvas → Blob → lien de téléchargement).
 */
export async function downloadChartPng(
  id: string,
  filename: string,
  watermark: string,
): Promise<void> {
  const chart = charts.get(id);
  if (!chart) return;
  const url = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' });
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('image'));
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  const pad = 40;
  canvas.width = img.width;
  canvas.height = img.height + pad;
  const g = canvas.getContext('2d');
  if (!g) return;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.drawImage(img, 0, 0);
  g.fillStyle = '#7a8590';
  g.font = '22px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  g.textAlign = 'right';
  g.textBaseline = 'middle';
  g.fillText(watermark, canvas.width - 20, img.height + pad / 2);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (blob) downloadBlob(blob, filename);
}

export function hasChart(id: string): boolean {
  return charts.has(id);
}
