// Currency Hedging for Canadians — math and scenario data.
//
// A Canadian investor holding a foreign (USD-denominated) equity book has two
// return sources on top of the local equity return: the spot FX move and the
// carry embedded in the forward used to hedge. For a hedge ratio h ∈ [0, 1]:
//
//   total = localReturn + (1 − h) × fxMove + h × carryRate
//
// carryRate ≈ rCAD − rForeign (covered-interest parity). When US rates exceed
// Canadian rates, carryRate is negative — hedging costs money.

export interface HedgeScenario {
  id: string;
  label: string;
  blurb: string;
  /** Equity return in the foreign (USD) currency, % */
  localReturn: number;
  /** CAD perspective FX move: positive means CAD fell (USD rose) — good for unhedged */
  fxMove: number;
  /** Annualised carry rate applied per unit of hedge; negative = cost */
  carryRate: number;
}

export const SCENARIOS: HedgeScenario[] = [
  {
    id: "flat-fx",
    label: "Flat FX",
    blurb: "Calm year, no currency move — carry is the only variable that changes with the hedge ratio",
    localReturn: 10.0,
    fxMove: 0.0,
    carryRate: -1.0,
  },
  {
    id: "cad-fell",
    label: "CAD Fell",
    blurb: "2015 style: oil collapse drove CAD down ~12% vs USD — a tailwind for unhedged Canadians",
    localReturn: 8.0,
    fxMove: 12.0,
    carryRate: -1.5,
  },
  {
    id: "cad-rose",
    label: "CAD Rose",
    blurb: "2017 style: oil recovery pushed CAD up ~8% vs USD — FX drag for unhedged Canadians",
    localReturn: 7.0,
    fxMove: -8.0,
    carryRate: -0.5,
  },
  {
    id: "high-carry",
    label: "High Carry Cost",
    blurb: "2022 style: Fed hiked aggressively, US rates far above Canadian — hedging was expensive",
    localReturn: -18.0,
    fxMove: 6.0,
    carryRate: -4.0,
  },
];

export const HEDGE_LEVELS = [
  { id: "unhedged", label: "Unhedged", short: "0%", ratio: 0 },
  { id: "half", label: "Half-Hedged", short: "50%", ratio: 0.5 },
  { id: "fully", label: "Fully Hedged", short: "100%", ratio: 1.0 },
] as const;

export type HedgeLevel = (typeof HEDGE_LEVELS)[number];

export interface HedgeResult {
  level: HedgeLevel;
  local: number;
  fxEffect: number;
  carry: number;
  total: number;
}

export function computeAll(scenario: HedgeScenario): HedgeResult[] {
  return HEDGE_LEVELS.map((level) => {
    const fxEffect = (1 - level.ratio) * scenario.fxMove;
    const carry = level.ratio * scenario.carryRate;
    return {
      level,
      local: scenario.localReturn,
      fxEffect,
      carry,
      total: scenario.localReturn + fxEffect + carry,
    };
  });
}
