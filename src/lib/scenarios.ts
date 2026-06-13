// Industry-standard sector taxonomy and teaching scenarios for the Attribution
// Playground. Sectors follow the full GICS classification (11 sectors); the
// benchmark weights and returns are generic, illustrative figures — broadly the
// shape of a developed-market equity index, but not any real index or product.

import { Sector } from "./attribution";

export interface SectorBase {
  name: string; // full GICS sector name
  short: string; // compact label for charts
  wb: number; // benchmark weight, %
  rb: number; // benchmark return in sector, %
}

// The 11 GICS sectors, in standard (sector-code) order. Benchmark weights sum
// to 100; returns vary around the ~4.2% benchmark so allocation actually bites.
export const GICS_BASE: SectorBase[] = [
  { name: "Energy", short: "Energy", wb: 5, rb: -2.0 },
  { name: "Materials", short: "Materials", wb: 4, rb: 2.5 },
  { name: "Industrials", short: "Indust.", wb: 10, rb: 3.5 },
  { name: "Consumer Discretionary", short: "Cons. Disc.", wb: 11, rb: 5.5 },
  { name: "Consumer Staples", short: "Cons. Stpl.", wb: 6, rb: 1.5 },
  { name: "Health Care", short: "Health Care", wb: 12, rb: 3.0 },
  { name: "Financials", short: "Financials", wb: 16, rb: 4.0 },
  { name: "Information Technology", short: "Info Tech", wb: 22, rb: 7.5 },
  { name: "Communication Services", short: "Comm. Svcs.", wb: 8, rb: 6.0 },
  { name: "Utilities", short: "Utilities", wb: 3, rb: 1.0 },
  { name: "Real Estate", short: "Real Estate", wb: 3, rb: -0.5 },
];

export const SHORT_NAME: Record<string, string> = Object.fromEntries(
  GICS_BASE.map((b) => [b.name, b.short]),
);

// A bet on a sector: an active weight (dw, in percentage points vs. benchmark)
// and a selection alpha (the portfolio's return in the sector minus benchmark).
// Sectors left out of a scenario are held neutral (wp = wb, rp = rb). Active
// weights within a scenario net to zero, so the book stays fully invested.
interface Bet {
  dw?: number;
  alpha?: number;
}

export interface Scenario {
  id: string;
  label: string;
  blurb: string;
  bets: Record<string, Bet>;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "balanced",
    label: "Balanced active book",
    blurb: "A diversified set of modest sector tilts and stock-selection bets.",
    bets: {
      "Information Technology": { dw: 3, alpha: 0.9 },
      Financials: { dw: 4, alpha: 0.9 },
      "Health Care": { dw: 2, alpha: 0.4 },
      Materials: { dw: -2, alpha: 0.5 },
      Energy: { dw: -4, alpha: -0.6 },
      Utilities: { dw: -3, alpha: -0.3 },
    },
  },
  {
    id: "neutral",
    label: "Benchmark-neutral",
    blurb: "No bets at all — every effect is zero. The baseline to tilt from.",
    bets: {},
  },
  {
    id: "tech",
    label: "Tech overweight",
    blurb: "Lean into growth: overweight tech and comms, fund it from defensives.",
    bets: {
      "Information Technology": { dw: 6, alpha: 1.2 },
      "Communication Services": { dw: 3, alpha: 0.6 },
      "Consumer Discretionary": { dw: 2, alpha: 0.4 },
      "Consumer Staples": { dw: -4, alpha: -0.2 },
      Utilities: { dw: -3, alpha: -0.1 },
      Energy: { dw: -2 },
      "Real Estate": { dw: -2, alpha: -0.3 },
    },
  },
  {
    id: "defensive",
    label: "Defensive tilt",
    blurb: "Risk-off: overweight staples, utilities and health care; cut cyclicals.",
    bets: {
      "Consumer Staples": { dw: 5, alpha: 0.3 },
      Utilities: { dw: 4, alpha: 0.2 },
      "Health Care": { dw: 3, alpha: 0.5 },
      "Information Technology": { dw: -5, alpha: -0.4 },
      "Consumer Discretionary": { dw: -4, alpha: -0.3 },
      Industrials: { dw: -3, alpha: -0.2 },
    },
  },
];

/** Expand a scenario's bets into a full 11-sector Sector array. */
export function buildScenario(s: Scenario): Sector[] {
  return GICS_BASE.map((b) => {
    const bet = s.bets[b.name] ?? {};
    const dw = bet.dw ?? 0;
    const alpha = bet.alpha ?? 0;
    return {
      name: b.name,
      wb: b.wb,
      wp: Math.round((b.wb + dw) * 10) / 10,
      rb: b.rb,
      rp: Math.round((b.rb + alpha) * 10) / 10,
    };
  });
}

export const DEFAULT_SECTORS = buildScenario(SCENARIOS[0]);

/** Identify which preset (if any) the current sectors match, for highlighting. */
export function matchScenario(sectors: Sector[]): string | null {
  const key = JSON.stringify(sectors);
  const hit = SCENARIOS.find((s) => JSON.stringify(buildScenario(s)) === key);
  return hit ? hit.id : null;
}
