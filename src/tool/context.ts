import type { Dict } from '../i18n/fr';
import type { Lang } from '../i18n/routes';
import { makeFormatter, type FormulaSymbols, type NumberFormatter } from '../lib/formulas';

/** Configuration transmise par la page (bloc JSON, jamais exécuté). */
export interface ToolConfig {
  lang: Lang;
  locale: string;
  t: Dict['tool'];
  symbols: FormulaSymbols;
  exampleUrl: string;
  homeUrl: string;
  watermark: string;
  methodologyUrl: string;
}

export interface ToolContext extends ToolConfig {
  f: NumberFormatter;
  pct: (fraction: number, digits?: number) => string;
  formatDate: (time: number) => string;
  weekPrefix: string;
}

export function readConfig(id = 'tool-config'): ToolContext {
  const node = document.getElementById(id);
  if (!node?.textContent) throw new Error('Configuration absente');
  const cfg = JSON.parse(node.textContent) as ToolConfig;
  const dateFmt = new Intl.DateTimeFormat(cfg.locale, {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const pctCache = new Map<number, Intl.NumberFormat>();
  return {
    ...cfg,
    f: makeFormatter(cfg.locale),
    pct: (x, digits = 1) => {
      let nf = pctCache.get(digits);
      if (!nf) {
        nf = new Intl.NumberFormat(cfg.locale, { style: 'percent', maximumFractionDigits: digits });
        pctCache.set(digits, nf);
      }
      return nf.format(x);
    },
    formatDate: (time) => dateFmt.format(new Date(time)),
    weekPrefix: cfg.lang === 'fr' ? 'S' : 'W',
  };
}
