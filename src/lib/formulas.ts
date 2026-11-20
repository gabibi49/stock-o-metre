import { ceilUnit, type SafetyMethod } from '../engine/safety';

/** Symboles affichés dans les formules (dépendent de la langue). */
export interface FormulaSymbols {
  ss: string;
  rop: string;
  target: string;
  cover: string;
  days: string;
}

export type NumberFormatter = (x: number, digits?: number) => string;

export interface SafetyValues {
  method: SafetyMethod;
  z: number;
  mu: number;
  sigma: number;
  lp: number;
  rp: number;
  sigmaLp: number;
  dpp: number;
  coverageDays: number;
  ss: number;
}

/** Formule du stock de sécurité, avec les valeurs remplacées (une ligne par étape). */
export function safetyFormula(v: SafetyValues, s: FormulaSymbols, f: NumberFormatter): string[] {
  const result = `= ${f(v.ss, 2)} → ${f(ceilUnit(v.ss), 0)}`;
  switch (v.method) {
    case 'demand':
      return [
        `${s.ss} = Z × σ × √(Lp + Rp)`,
        `= ${f(v.z, 4)} × ${f(v.sigma, 2)} × √(${f(v.lp, 3)} + ${f(v.rp, 3)})`,
        result,
      ];
    case 'demandLead':
      return [
        `${s.ss} = Z × √((Lp + Rp) × σ² + μ² × σLp²)`,
        `= ${f(v.z, 4)} × √((${f(v.lp, 3)} + ${f(v.rp, 3)}) × ${f(v.sigma, 2)}² + ${f(v.mu, 2)}² × ${f(v.sigmaLp, 3)}²)`,
        result,
      ];
    case 'coverage':
      return [
        `${s.ss} = (μ ÷ ${f(v.dpp, 4)}) × ${s.days}`,
        `= (${f(v.mu, 2)} ÷ ${f(v.dpp, 4)}) × ${f(v.coverageDays, 2)}`,
        result,
      ];
  }
}

export function ropFormula(
  mu: number,
  lp: number,
  ss: number,
  s: FormulaSymbols,
  f: NumberFormatter,
): string[] {
  const rop = mu * lp + ss;
  return [
    `${s.rop} = μ × Lp + ${s.ss}`,
    `= ${f(mu, 2)} × ${f(lp, 3)} + ${f(ss, 2)}`,
    `= ${f(rop, 2)} → ${f(ceilUnit(rop), 0)}`,
  ];
}

export function targetFormula(
  mu: number,
  lp: number,
  rp: number,
  ss: number,
  s: FormulaSymbols,
  f: NumberFormatter,
): string[] {
  const target = mu * (lp + rp) + ss;
  return [
    `${s.target} = μ × (Lp + Rp) + ${s.ss}`,
    `= ${f(mu, 2)} × (${f(lp, 3)} + ${f(rp, 3)}) + ${f(ss, 2)}`,
    `= ${f(target, 2)} → ${f(ceilUnit(target), 0)}`,
  ];
}

export function coverageFormula(
  stock: number,
  perDay: number,
  s: FormulaSymbols,
  f: NumberFormatter,
): string[] {
  if (perDay <= 0) return [`${s.cover} = ${f(stock, 2)} ÷ 0 = ∞`];
  return [`${s.cover} = ${f(stock, 2)} ÷ ${f(perDay, 3)}`, `= ${f(stock / perDay, 1)} ${s.days}`];
}

/** Formateur de nombres localisé, sans zéros superflus (ex. 2,5 et non 2,500). */
export function makeFormatter(locale: string): NumberFormatter {
  const cache = new Map<number, Intl.NumberFormat>();
  return (x: number, digits = 2) => {
    let nf = cache.get(digits);
    if (!nf) {
      nf = new Intl.NumberFormat(locale, {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0,
      });
      cache.set(digits, nf);
    }
    return nf.format(x);
  };
}
