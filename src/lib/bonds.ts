// Key-rate duration repricing for a bond portfolio.
//
// A first-order approximation of the price change from a non-parallel shift in
// the curve. For each key tenor i with key-rate duration KRD_i and yield change
// Δy_i (in decimal), the portfolio return is:
//
//   ΔP/P ≈ - Σ KRD_i * Δy_i
//
// Duration is a first-order (linear) measure; this ignores convexity, which
// matters for large moves but not for the intuition the tool is built to show.

export const TENORS = [2, 5, 10, 30] as const;
export type Tenor = (typeof TENORS)[number];

export interface Position {
  tenor: Tenor;
  krd: number; // key-rate duration (years)
}

// A representative ladder: most risk in the belly, some long-end exposure.
export const DEFAULT_PORTFOLIO: Position[] = [
  { tenor: 2, krd: 1.1 },
  { tenor: 5, krd: 2.4 },
  { tenor: 10, krd: 2.7 },
  { tenor: 30, krd: 1.3 },
];

export const BASE_CURVE: Record<Tenor, number> = {
  2: 3.6,
  5: 3.4,
  10: 3.5,
  30: 3.7,
};

export interface RepriceResult {
  totalReturnPct: number;
  pnl: number;
  byTenor: { tenor: Tenor; krd: number; dy: number; contribPct: number }[];
  effectiveDuration: number;
}

export function reprice(
  portfolio: Position[],
  base: Record<Tenor, number>,
  shocked: Record<Tenor, number>,
  marketValue: number,
): RepriceResult {
  let totalReturn = 0;
  const byTenor = portfolio.map((p) => {
    const dy = (shocked[p.tenor] - base[p.tenor]) / 100; // bps→decimal
    const contrib = -p.krd * dy;
    totalReturn += contrib;
    return {
      tenor: p.tenor,
      krd: p.krd,
      dy: shocked[p.tenor] - base[p.tenor],
      contribPct: contrib * 100,
    };
  });
  const effectiveDuration = portfolio.reduce((s, p) => s + p.krd, 0);
  return {
    totalReturnPct: totalReturn * 100,
    pnl: marketValue * totalReturn,
    byTenor,
    effectiveDuration,
  };
}
