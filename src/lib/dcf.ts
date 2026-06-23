// Two-stage discounted-cash-flow valuation, run on real companies.
//
// Free cash flow is forecast explicitly over a 10-year horizon at a per-company
// near-term growth rate, then a Gordon-growth terminal value captures the rest:
//
//   EV = Σ_{t=1..N} FCF_t / (1 + WACC)^t  +  TV / (1 + WACC)^N
//   TV = FCF_N · (1 + g) / (WACC − g)
//
// Equity value = EV − net debt; per share = equity / diluted shares. The hard
// anchors - starting free cash flow, net debt, and share count - come straight
// from each company's latest annual report (SEC EDGAR, see `source`). The
// near-term growth rate is the one explicitly *assumed* input, and WACC and
// terminal growth are the scenario "lens" the reader chooses. The whole point:
// the business is fixed, but fair value swings on the assumptions.

export const HORIZON = 10; // explicit forecast years, N

export interface Company {
  id: string;
  name: string;
  short: string; // compact label
  ticker?: string;
  fcf1: number; // year-1 free cash flow, $m (see fcfNote)
  nearGrowth: number; // assumed annual FCF growth over the horizon
  netDebt: number; // total debt − cash & marketable securities, $m
  shares: number; // diluted shares, millions
  price?: number; // market price on the filing date, $
  asOf?: string; // filing date the price is taken as of
  fy?: string; // fiscal year of the source filing
  cik?: string; // SEC CIK, for the EDGAR source link
  synthetic?: boolean;
}

// Real anchors: free cash flow is a trailing 3-year average of (operating cash
// flow − capex) to normalize one-off years; net debt and shares are the latest
// reported figures; price is the close on the 10-K filing date. Near-term
// growth is an assumption, set to a defensible figure for each business.
export const COMPANIES: Company[] = [
  {
    id: "apple",
    name: "Apple",
    short: "Apple",
    ticker: "AAPL",
    fcf1: 102386,
    nearGrowth: 0.08,
    netDebt: 43960,
    shares: 14776.4,
    price: 270.37,
    asOf: "2025-10-31",
    fy: "FY2025",
    cik: "0000320193",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    short: "Microsoft",
    ticker: "MSFT",
    fcf1: 68386,
    nearGrowth: 0.12,
    netDebt: -51414,
    shares: 7433.2,
    price: 513.24,
    asOf: "2025-07-30",
    fy: "FY2025",
    cik: "0000789019",
  },
  {
    id: "costco",
    name: "Costco",
    short: "Costco",
    ticker: "COST",
    fcf1: 7070,
    nearGrowth: 0.09,
    netDebt: -9460,
    shares: 443.2,
    price: 914.8,
    asOf: "2025-10-08",
    fy: "FY2025",
    cik: "0000909832",
  },
  {
    id: "pg",
    name: "Procter & Gamble",
    short: "P&G",
    ticker: "PG",
    fcf1: 14785,
    nearGrowth: 0.05,
    netDebt: 39754,
    shares: 2342.4,
    price: 150.76,
    asOf: "2025-08-04",
    fy: "FY2025",
    cik: "0000080424",
  },
  {
    id: "synthetic",
    name: "Illustrative company",
    short: "Illustrative",
    fcf1: 1000,
    nearGrowth: 0.08,
    netDebt: 2000,
    shares: 500,
    synthetic: true,
  },
];

export const DEFAULT_COMPANY = COMPANIES[0].id;

export function getCompany(id: string): Company {
  return COMPANIES.find((c) => c.id === id) ?? COMPANIES[0];
}

/** SEC EDGAR filings page for a company, used as the cited source link. */
export function edgarLink(c: Company): string | null {
  return c.cik
    ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${c.cik}&type=10-K`
    : null;
}

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
  tvShare: number; // tvPV / ev - how much of the value lives past the forecast
}

/** Value a company at a given WACC and terminal growth rate (both decimals). */
export function value(c: Company, wacc: number, g: number): Valuation {
  const years: YearPV[] = [];
  let pvExplicit = 0;
  let fcfN = c.fcf1;
  for (let t = 1; t <= HORIZON; t++) {
    const fcf = c.fcf1 * Math.pow(1 + c.nearGrowth, t - 1);
    const discountFactor = 1 / Math.pow(1 + wacc, t);
    const pv = fcf * discountFactor;
    years.push({ year: t, fcf, discountFactor, pv });
    pvExplicit += pv;
    fcfN = fcf;
  }
  const tvUndiscounted = (fcfN * (1 + g)) / (wacc - g);
  const tvDiscountFactor = 1 / Math.pow(1 + wacc, HORIZON);
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

// Each lens is a named market narrative that fixes a discount rate and a
// terminal growth rate. The business underneath never changes - only the lens.
export interface Lens {
  id: string;
  label: string;
  short: string;
  blurb: string;
  wacc: number; // decimal
  g: number; // decimal
}

export const LENSES: Lens[] = [
  {
    id: "base",
    label: "Base case",
    short: "Base case",
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

export const DEFAULT_LENS = LENSES[0].id;

export function getLens(id: string): Lens {
  return LENSES.find((l) => l.id === id) ?? LENSES[0];
}

export interface State {
  company: string;
  lens: string;
}

export const DEFAULT_STATE: State = { company: DEFAULT_COMPANY, lens: DEFAULT_LENS };

export interface FieldBar {
  id: string;
  short: string;
  price: number; // implied price under this lens
  active: boolean;
}

/** Implied price for a company under every lens, for the football field. */
export function footballField(c: Company, activeLensId: string): FieldBar[] {
  return LENSES.map((l) => ({
    id: l.id,
    short: l.short,
    price: value(c, l.wacc, l.g).perShare,
    active: l.id === activeLensId,
  }));
}

/** The lens whose implied price sits closest to the market price. */
export function closestLens(c: Company): Lens | null {
  if (c.price == null) return null;
  const price = c.price;
  return LENSES.reduce((a, b) =>
    Math.abs(value(c, b.wacc, b.g).perShare - price) <
    Math.abs(value(c, a.wacc, a.g).perShare - price)
      ? b
      : a,
  );
}
