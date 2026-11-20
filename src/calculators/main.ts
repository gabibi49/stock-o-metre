/**
 * Mini-calculateurs (sans fichier) : calcul immédiat à chaque saisie,
 * formule affichée avec les valeurs remplacées. Aucun réseau.
 */
import { normInv } from '../engine/normal';
import { ceilUnit, MAX_SERVICE_LEVEL, MIN_SERVICE_LEVEL } from '../engine/safety';
import type { Dict } from '../i18n/fr';
import type { CalcKey } from '../i18n/routes';
import {
  coverageFormula,
  makeFormatter,
  ropFormula,
  safetyFormula,
  targetFormula,
  type FormulaSymbols,
} from '../lib/formulas';

interface CalcConfig {
  key: CalcKey;
  lang: 'fr' | 'en';
  locale: string;
  calc: Dict['calc'];
  symbols: FormulaSymbols;
  conv: string;
  z: string;
}

const cfgNode = document.getElementById('calc-config');
const form = document.getElementById('calc-form') as HTMLFormElement | null;
if (cfgNode?.textContent && form) {
  const cfg = JSON.parse(cfgNode.textContent) as CalcConfig;
  const f = makeFormatter(cfg.locale);
  const pct = new Intl.NumberFormat(cfg.locale, { style: 'percent', maximumFractionDigits: 2 });
  const out = {
    value: document.getElementById('calc-value') as HTMLElement,
    note: document.getElementById('calc-note') as HTMLElement,
    formula: document.getElementById('calc-formula') as HTMLElement,
    error: document.getElementById('calc-error') as HTMLElement,
  };
  const fill = (template: string, vars: Record<string, string>) =>
    template.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

  const read = (name: string): number | null => {
    const input = form.elements.namedItem(name) as HTMLInputElement | null;
    if (!input) return null;
    const v = Number(input.value.trim().replace(',', '.'));
    const min = input.min === '' ? 0 : Number(input.min);
    const max = input.max === '' ? Infinity : Number(input.max);
    const ok = input.value.trim() !== '' && Number.isFinite(v) && v >= min && v <= max;
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok ? v : null;
  };

  /** Lit plusieurs champs ; null si l'un d'eux est vide ou invalide. */
  const readAll = <K extends string>(names: readonly K[]): Record<K, number> | null => {
    const values = {} as Record<K, number>;
    let ok = true;
    for (const name of names) {
      const v = read(name);
      if (v === null) ok = false;
      else values[name] = v;
    }
    return ok ? values : null;
  };

  const render = (value: string, note: string, lines: string[]) => {
    out.value.textContent = value;
    out.note.textContent = note;
    out.formula.textContent = lines.join('\n');
    out.error.textContent = '';
  };

  const compute = (): void => {
    const c = cfg.calc;
    const s = cfg.symbols;
    if (cfg.key === 'calcSafety') {
      const v = readAll(['mu', 'sigma', 'lead', 'review', 'leadSd', 'service'] as const);
      if (!v) return invalid();
      const { mu, sigma, lead, review, leadSd, service } = v;
      const period = (form.elements.namedItem('period') as HTMLSelectElement).value;
      const dpp = period === 'day' ? 1 : period === 'week' ? 7 : 30.4375;
      const p = (service as number) / 100;
      if (p < MIN_SERVICE_LEVEL || p > MAX_SERVICE_LEVEL) return invalid();
      const z = normInv(p);
      const lp = (lead as number) / dpp;
      const rp = (review as number) / dpp;
      const sigmaLp = (leadSd as number) / dpp;
      const method = (leadSd as number) > 0 ? 'demandLead' : 'demand';
      const ss =
        method === 'demand'
          ? z * (sigma as number) * Math.sqrt(lp + rp)
          : z * Math.sqrt((lp + rp) * (sigma as number) ** 2 + (mu as number) ** 2 * sigmaLp ** 2);
      const conv = fill(cfg.conv, {
        L: f(lead as number, 2),
        R: f(review as number, 2),
        dpp: f(dpp, 4),
        lp: f(lp, 4),
        rp: f(rp, 4),
      });
      const zLine = fill(cfg.z, { sl: pct.format(p), z: f(z, 4) });
      render(`${f(ceilUnit(ss), 0)} ${c.units}`, `${f(ss, 2)} (${c.rounded})`, [
        conv,
        zLine,
        '',
        ...safetyFormula(
          {
            method,
            z,
            mu: mu as number,
            sigma: sigma as number,
            lp,
            rp,
            sigmaLp,
            dpp,
            coverageDays: 0,
            ss,
          },
          s,
          f,
        ),
      ]);
      return;
    }
    if (cfg.key === 'calcRop') {
      const v = readAll(['daily', 'lead', 'ss'] as const);
      if (!v) return invalid();
      const { daily, lead, ss } = v;
      const rop = daily * lead + ss;
      render(
        `${f(ceilUnit(rop), 0)} ${c.units}`,
        `${f(rop, 2)} (${c.rounded})`,
        ropFormula(daily, lead, ss, s, f),
      );
      return;
    }
    if (cfg.key === 'calcTarget') {
      const v = readAll(['daily', 'lead', 'review', 'ss'] as const);
      if (!v) return invalid();
      const { daily, lead, review, ss } = v;
      const target = daily * (lead + review) + ss;
      render(
        `${f(ceilUnit(target), 0)} ${c.units}`,
        `${f(target, 2)} (${c.rounded})`,
        targetFormula(daily, lead, review, ss, s, f),
      );
      return;
    }
    const v = readAll(['stock', 'daily'] as const);
    if (!v) return invalid();
    const { stock, daily } = v;
    if (daily === 0) {
      render('∞', c.coverageInfinite, coverageFormula(stock, 0, s, f));
      return;
    }
    render(`${f(stock / daily, 1)} ${c.days}`, '', coverageFormula(stock, daily, s, f));
  };

  const invalid = (): void => {
    out.value.textContent = '—';
    out.note.textContent = '';
    out.formula.textContent = '';
    out.error.textContent = cfg.calc.invalid;
  };

  form.addEventListener('input', compute);
  form.addEventListener('submit', (e) => e.preventDefault());
  compute();
}
