import type { AnalysisResult, ItemResult } from '../engine/analyze';
import { fmt } from '../i18n';
import { coverageFormula, ropFormula, safetyFormula, targetFormula } from '../lib/formulas';
import type { ToolContext } from './context';
import { el, setChildren } from './dom';

/** Panneau « Comment c'est calculé ? » pour l'article sélectionné. */
export function renderExplain(ctx: ToolContext, a: AnalysisResult, r: ItemResult | null): void {
  const body = document.getElementById('explain-body');
  if (!body) return;
  const t = ctx.t.explain;
  if (!r) {
    setChildren(body, el('p', {}, t.none));
    return;
  }
  const f = ctx.f;
  const p = r.policy;
  const s = ctx.symbols;
  const block = (title: string, lines: string[]) =>
    el('div', {}, el('h4', {}, title), el('p', { class: 'calc-formula' }, lines.join('\n')));
  const nodes: HTMLElement[] = [
    el('p', {}, el('strong', {}, r.id), r.label ? ` — ${r.label}` : ''),
    el(
      'p',
      {},
      fmt(t.data, {
        n: r.n,
        period: ctx.t.charts.periodWord[a.kind],
        mu: f(r.mu, 3),
        sigma: f(r.sigma, 3),
        cv: r.cv === null ? ctx.t.results.na : f(r.cv, 3),
      }),
    ),
    el(
      'p',
      {},
      fmt(t.conv, {
        L: f(r.params.leadTimeDays, 2),
        R: f(r.params.reviewDays, 2),
        dpp: f(p.dpp, 4),
        lp: f(p.lp, 4),
        rp: f(p.rp, 4),
      }),
      r.params.method === 'demandLead'
        ? ` ${fmt(t.convSd, { sd: f(r.params.leadTimeSdDays, 2), dpp: f(p.dpp, 4), sdp: f(p.sigmaLp, 4) })}`
        : '',
    ),
  ];
  if (r.params.method !== 'coverage') {
    nodes.push(
      el('p', {}, fmt(t.z, { abc: r.abc, sl: ctx.pct(r.params.serviceLevel, 2), z: f(p.z, 4) })),
    );
  }
  nodes.push(
    block(
      t.ss,
      safetyFormula(
        {
          method: r.params.method,
          z: p.z,
          mu: r.mu,
          sigma: r.sigma,
          lp: p.lp,
          rp: p.rp,
          sigmaLp: p.sigmaLp,
          dpp: p.dpp,
          coverageDays: r.params.coverageDays,
          ss: p.ss,
        },
        s,
        f,
      ),
    ),
    block(t.rop, ropFormula(r.mu, p.lp, p.ss, s, f)),
    block(t.target, targetFormula(r.mu, p.lp, p.rp, p.ss, s, f)),
  );
  if (r.currentStock !== null) {
    nodes.push(block(t.coverage, coverageFormula(r.currentStock, p.muPerDay, s, f)));
  }
  nodes.push(
    el(
      'p',
      { class: 'field-hint' },
      t.rounding,
      ' ',
      el('a', { href: ctx.methodologyUrl }, t.more),
    ),
  );
  setChildren(body, ...nodes);
}
