// Two-stage discounted-cash-flow valuation.
//
// A single fixed company is valued under different (WACC, terminal-growth)
// assumptions. Free cash flow grows at a near-term rate over an explicit
// horizon, then a Gordon-growth terminal value captures everything beyond it:
//
//   EV = Σ_{t=1..N} FCF_t / (1 + WACC)^t  +  TV / (1 + WACC)^N
//   TV = FCF_N · (1 + g) / (WACC − g)
//
// Equity value = EV − net debt; per share = equity / shares outstanding. The
// company (cash flows, debt, share count) is illustrative and held constant —
// the whole point is that fair value swings on the discount-rate and terminal
// assumptions alone, not on anything about the business.

export interface Company {
  fcf1: number; // year-1 free cash flow, $m
  nearTermGrowth: number; // annual FCF growth over the explicit horizon
  horizon: number; // explicit forecast years, N
  netDebt: number; // $m
  shares: number; // millions of shares
}

// A mid-cap with a steady cash flow base, some leverage, and a 5-year window.
export const COMPANY: Company = {
  fcf1: 1000,
  nearTermGrowth: 0.08,
  horizon: 5,
  netDebt: 2000,
  shares: 500,
};

export interface YearPV {
  year: number;
  fcf: number; // forecast free cash flow, $m
  discountFactor: number; // 1 / (1+WACC)^t
  pv: number; // present value, $m
}

export interface Valuation {
  years: YearPV[];
  tvUndiscounted: number; // terminal value at the horizon, $m
  tvDiscountFactor: number;
  tvPV: number; // present value of the terminal value, $m
  pvExplicit: number; // PV of the explicit forecast FCFs, $m
  ev: number; // enterprise value, $m
  netDebt: number;
  equity: number; // equity value, $m
  perShare: number; // implied price, $
  tvShare: number; // tvPV / ev — how much of the value lives past the forecast
}

/** Value the company at a given WACC and terminal growth rate (both decimals). */
export function value(wacc: number, g: number, c: Company = COMPANY): Valuation {
  const years: YearPV[] = [];
  let pvExplicit = 0;
  let fcfN = c.fcf1;
  for (let t = 1; t <= c.horizon; t++) {
    const fcf = c.fcf1 * Math.pow(1 + c.nearTermGrowth, t - 1);
    const discountFactor = 1 / Math.pow(1 + wacc, t);
    const pv = fcf * discountFactor;
    years.push({ year: t, fcf, discountFactor, pv });
    pvExplicit += pv;
    fcfN = fcf;
  }
  const tvUndiscounted = (fcfN * (1 + g)) / (wacc - g);
  const tvDiscountFactor = 1 / Math.pow(1 + wacc, c.horizon);
  const tvPV = tvUndiscounted * tvDiscountFactor;
  const ev = pvExplicit + tvPV;
  const equity = ev - c.netDebt;
  return {
    years,
    tvUndiscounted,
    tvDiscountFactor,
    tvPV,
    pvExplicit,
    ev,
    netDebt: c.netDebt,
    equity,
    perShare: equity / c.shares,
    tvShare: tvPV / ev,
  };
}

// Each preset is a named market narrative that fixes a discount rate and a
// terminal growth rate. The business underneath never changes — only the lens.
export interface Scenario {
  id: string;
  label: string;
  short: string; // compact label for the football field
  blurb: string;
  wacc: number; // decimal
  g: number; // decimal
}

export const SCENARIOS: Scenario[] = [
  {
    id: "base",
    label: "Base case",
    short: "Base",
    blurb: "A normal discount rate and a terminal growth rate near trend GDP.",
    wacc: 0.09,
    g: 0.025,
  },
  {
    id: "lower",
    label: "Lower for longer",
    short: "Low rates",
    blurb: "Cheap capital and an optimistic exit: drop the WACC, lift terminal growth.",
    wacc: 0.075,
    g: 0.03,
  },
  {
    id: "higher",
    label: "Higher-rate regime",
    short: "High rates",
    blurb: "Rates reset higher and growth fades: raise the WACC, trim terminal growth.",
    wacc: 0.11,
    g: 0.02,
  },
  {
    id: "perfection",
    label: "Priced for perfection",
    short: "Perfection",
    blurb: "The bull case stacked: the lowest defensible WACC against the highest growth.",
    wacc: 0.07,
    g: 0.035,
  },
];

export const DEFAULT_SCENARIO = SCENARIOS[0].id;

export function getScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

// A football-field bar: the price range when a scenario's assumptions are
// flexed by a small, plausible amount in each direction, around its central
// estimate. The optimistic corner pairs a lower WACC with higher growth; the
// pessimistic corner does the reverse.
const WACC_BAND = 0.005; // ±50bp on the discount rate
const G_BAND = 0.0025; // ±25bp on terminal growth

export interface FieldBar {
  id: string;
  short: string;
  lo: number; // pessimistic price
  central: number; // stated price
  hi: number; // optimistic price
  active: boolean;
}

export function footballField(activeId: string): FieldBar[] {
  return SCENARIOS.map((s) => ({
    id: s.id,
    short: s.short,
    lo: value(s.wacc + WACC_BAND, s.g - G_BAND).perShare,
    central: value(s.wacc, s.g).perShare,
    hi: value(s.wacc - WACC_BAND, s.g + G_BAND).perShare,
    active: s.id === activeId,
  }));
}
