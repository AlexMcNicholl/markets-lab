// Research Portfolio — the model book and the pure calcs that drive the cockpit.
//
// The book is synthetic in CAPITAL ($1M notional paper book) and real in
// PRICES + REASONING. Every position has a dated entry and a real entry price;
// marks are real closes "as of" the book date. Nothing here invents a return —
// the numbers are mark-to-market on public prices from a dated entry.
//
// This module is deliberately side-effect-free and unit-testable: it takes the
// baked book (src/data/portfolio.json) and derives current weights from price
// drift, per-name P&L contribution, the risk lens, and the Brinson-Fachler
// sector inputs (handed straight to src/lib/attribution.ts — the same engine the
// Attribution Playground uses, so the two can't drift apart).

import { Sector } from "./attribution";

// Full 11-sector GICS taxonomy, in standard sector-code order. Any sector
// grouping on the site uses this list, never an ad-hoc subset.
export type GicsSector =
  | "Energy"
  | "Materials"
  | "Industrials"
  | "Consumer Discretionary"
  | "Consumer Staples"
  | "Health Care"
  | "Financials"
  | "Information Technology"
  | "Communication Services"
  | "Utilities"
  | "Real Estate";

export const GICS_SECTORS: GicsSector[] = [
  "Energy",
  "Materials",
  "Industrials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Health Care",
  "Financials",
  "Information Technology",
  "Communication Services",
  "Utilities",
  "Real Estate",
];

// Compact sector labels for charts and tight tables.
export const SECTOR_SHORT: Record<GicsSector, string> = {
  Energy: "Energy",
  Materials: "Materials",
  Industrials: "Indust.",
  "Consumer Discretionary": "Cons. Disc.",
  "Consumer Staples": "Cons. Stpl.",
  "Health Care": "Health Care",
  Financials: "Financials",
  "Information Technology": "Info Tech",
  "Communication Services": "Comm. Svcs.",
  Utilities: "Utilities",
  "Real Estate": "Real Estate",
};

export type Conviction = "high" | "medium" | "low";

/** Number of filled pips (out of 5) shown on a conviction meter. */
export const CONVICTION_PIPS: Record<Conviction, number> = {
  high: 5,
  medium: 3,
  low: 2,
};

export const CONVICTION_LABEL: Record<Conviction, string> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

export interface Position {
  ticker: string; // "CNQ.TO"
  name: string;
  sector: GicsSector;
  thesisOneLiner: string;
  conviction: Conviction;
  /** Conviction-driven target weight, as a fraction of notional. */
  targetWeight: number;
  entryDate: string; // ISO — dated, no backfill
  entryPrice: number; // real close on the entry date
  currentPrice: number; // real close "as of" the book date
  /** Real close on the book's inception date — the common attribution window start. */
  windowStartPrice: number;
  /** Estimated equity beta vs. the benchmark (illustrative, stated). */
  beta: number;
  killCriteria: string[]; // "what would change my mind"
  frameworkSlug: string; // registry slug of the tool that did the analysis
  noteSlug: string; // research-note id
}

export interface BenchmarkSectorRow {
  sector: GicsSector;
  /** Published S&P/TSX Composite sector weight, as a fraction. */
  weight: number;
  /** Benchmark sector total return over the attribution window, in percent. */
  windowReturn: number;
  /** True when windowReturn is a sourced sector-ETF return vs. a composite proxy. */
  sourced: boolean;
}

export interface BenchmarkSpec {
  name: string; // "S&P/TSX Composite"
  weightsAsOf: string; // snapshot date of the published sector weights
  /** Composite total return over the attribution window, in percent. */
  windowReturn: number;
  source?: { label: string; href: string };
  sectors: BenchmarkSectorRow[];
}

export interface EquityPoint {
  date: string;
  value: number; // marked-to-market book equity, $
}

export interface Book {
  /** "real" = marks are sourced closes; "estimate" = flagged placeholder marks. */
  dataMode?: "real" | "estimate";
  asOf: string; // mark date
  inception: string; // earliest entry / attribution window start
  notionalCapital: number; // $1,000,000 paper book
  cashWeight: number; // target cash weight, fraction of notional
  remarkCadence: string; // honest re-mark cadence, e.g. "monthly"
  benchmark: BenchmarkSpec;
  positions: Position[];
  /** Baked mark-to-market equity series, inception → asOf (needs price history). */
  equityCurve: EquityPoint[];
}

// ── Derived position-level figures ──────────────────────────────────────────

export interface PositionDerived extends Position {
  costBasis: number; // targetWeight × notional (cash committed at entry)
  shares: number; // costBasis / entryPrice
  marketValue: number; // shares × currentPrice
  currentWeight: number; // marketValue / book equity (drifted)
  returnSinceEntry: number; // currentPrice / entryPrice − 1
  windowReturn: number; // currentPrice / windowStartPrice − 1 (common window)
  pnl: number; // marketValue − costBasis
  contribution: number; // pnl / notional → contribution to total book return
}

/** Cash sleeve held flat at cost (a paper book parks uninvested capital). */
export function cashValue(book: Book): number {
  return book.cashWeight * book.notionalCapital;
}

/**
 * Expand each position with cost basis, share count, mark-to-market value, and
 * the drifted current weight. Weights are a fraction of total book equity
 * (positions + cash), so they reflect where the money actually sits today, not
 * the target.
 */
export function derivePositions(book: Book): PositionDerived[] {
  const { notionalCapital: notional } = book;
  const raw = book.positions.map((p) => {
    const costBasis = p.targetWeight * notional;
    const shares = costBasis / p.entryPrice;
    const marketValue = shares * p.currentPrice;
    return {
      ...p,
      costBasis,
      shares,
      marketValue,
      returnSinceEntry: p.currentPrice / p.entryPrice - 1,
      windowReturn: p.currentPrice / p.windowStartPrice - 1,
      pnl: marketValue - costBasis,
      contribution: (marketValue - costBasis) / notional,
    };
  });
  const equity = raw.reduce((s, p) => s + p.marketValue, 0) + cashValue(book);
  return raw.map((p) => ({ ...p, currentWeight: p.marketValue / equity }));
}

/** Marked-to-market book equity today (positions + cash). */
export function bookEquity(book: Book): number {
  const pos = derivePositions(book).reduce((s, p) => s + p.marketValue, 0);
  return pos + cashValue(book);
}

/** Total book return since inception, as a fraction. */
export function bookReturn(book: Book): number {
  return bookEquity(book) / book.notionalCapital - 1;
}

/** Current cash weight after drift (cash held flat while positions move). */
export function currentCashWeight(book: Book): number {
  return cashValue(book) / bookEquity(book);
}

// ── Contribution waterfall ──────────────────────────────────────────────────

export interface ContributionRow {
  label: string; // ticker, or "Cash"
  contribution: number; // contribution to total book return, fraction
  isCash?: boolean;
}

/** Per-name contribution to book return, largest-magnitude first; cash included. */
export function contributionRows(book: Book): ContributionRow[] {
  const rows: ContributionRow[] = derivePositions(book).map((p) => ({
    label: p.ticker,
    contribution: p.contribution,
  }));
  // Cash contributes nothing to return but is part of the book — show it so the
  // bars sum to the headline number with nothing swept under the rug.
  rows.push({ label: "Cash", contribution: 0, isCash: true });
  return rows.sort((a, b) => b.contribution - a.contribution);
}

// ── Risk lens ───────────────────────────────────────────────────────────────

export interface RiskLens {
  top5Concentration: number; // sum of the 5 largest name weights, fraction
  equityBeta: number; // weight-weighted beta of the book (cash = 0)
  cashBuffer: number; // current cash weight, fraction
  largestName: { ticker: string; weight: number };
  numNames: number;
}

export function riskLens(book: Book): RiskLens {
  const pos = derivePositions(book);
  const byWeight = [...pos].sort((a, b) => b.currentWeight - a.currentWeight);
  const top5 = byWeight.slice(0, 5).reduce((s, p) => s + p.currentWeight, 0);
  const equityBeta = pos.reduce((s, p) => s + p.currentWeight * p.beta, 0);
  const largest = byWeight[0];
  return {
    top5Concentration: top5,
    equityBeta,
    cashBuffer: currentCashWeight(book),
    largestName: { ticker: largest.ticker, weight: largest.currentWeight },
    numNames: pos.length,
  };
}

// ── Allocation vs. benchmark ────────────────────────────────────────────────

export interface AllocationRow {
  sector: GicsSector;
  portfolioWeight: number; // book weight in sector (ex-cash sleeve), fraction
  benchmarkWeight: number; // published TSX weight, fraction
  active: number; // portfolio − benchmark, fraction
}

/** Book vs. benchmark weight by GICS sector, in standard sector order. */
export function allocationBySector(book: Book): AllocationRow[] {
  const pos = derivePositions(book);
  return GICS_SECTORS.map((sector) => {
    const portfolioWeight = pos
      .filter((p) => p.sector === sector)
      .reduce((s, p) => s + p.currentWeight, 0);
    const bench = book.benchmark.sectors.find((b) => b.sector === sector);
    const benchmarkWeight = bench ? bench.weight : 0;
    return {
      sector,
      portfolioWeight,
      benchmarkWeight,
      active: portfolioWeight - benchmarkWeight,
    };
  });
}

// ── Brinson-Fachler inputs (handed to src/lib/attribution.ts) ────────────────

/**
 * Map the book onto the Sector[] shape the attribution engine consumes — one
 * row per GICS sector, all figures in percent. Single-period over the common
 * window [inception → asOf]:
 *
 *   wp = book current weight in the sector (drifted, ex-cash)
 *   wb = published S&P/TSX Composite sector weight
 *   rp = value-weighted window return of the names held in the sector
 *   rb = benchmark sector return over the same window
 *
 * Portfolio weights are normalised over the invested sleeve (ex-cash) so they
 * sum to 100 like the benchmark — that's what makes the three effects sum to
 * total active return exactly. Cash is a separate drag, reported in the risk
 * lens, not a Brinson sector. This is the exact array used both for the on-page
 * attribution panel and for the deep-link into /attribution, so the cockpit and
 * the playground show the identical decomposition.
 */
export function attributionSectors(book: Book): Sector[] {
  const pos = derivePositions(book);
  const invested = pos.reduce((s, p) => s + p.marketValue, 0);
  return GICS_SECTORS.map((sector) => {
    const held = pos.filter((p) => p.sector === sector);
    const bench = book.benchmark.sectors.find((b) => b.sector === sector);
    const wb = bench ? bench.weight * 100 : 0;
    const rb = bench ? bench.windowReturn : 0;
    const wp =
      invested > 0
        ? (held.reduce((s, p) => s + p.marketValue, 0) / invested) * 100
        : 0;
    // Value-weighted portfolio return in the sector; falls back to the
    // benchmark when the sector is empty (wp = 0, so it can't affect anything).
    const held$ = held.reduce((s, p) => s + p.marketValue, 0);
    const rp =
      held$ > 0
        ? (held.reduce((s, p) => s + p.marketValue * p.windowReturn, 0) /
            held$) *
          100
        : rb;
    return {
      name: sector,
      wp: Math.round(wp * 100) / 100,
      wb: Math.round(wb * 100) / 100,
      rp: Math.round(rp * 100) / 100,
      rb: Math.round(rb * 100) / 100,
    };
  });
}
