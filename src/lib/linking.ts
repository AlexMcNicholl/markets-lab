// Multi-period linking of single-period arithmetic active returns.
//
// Single-period attribution effects are arithmetic, but returns compound. So
// the naive sum of each period's active return (rp - rb) does NOT equal the
// realised compounded active return — the difference is the linking residual.
//
// Carino's logarithmic algorithm distributes that residual back onto each
// period so the per-period contributions sum to the compounded active return
// exactly. For period t with portfolio return rp_t and benchmark return rb_t
// (decimals), and total compounded returns Rp, Rb:
//
//   k_t  = ln(1 + rp_t) - ln(1 + rb_t)) / (rp_t - rb_t)
//   k    = ln(1 + Rp)   - ln(1 + Rb))   / (Rp - Rb)
//   contribution_t = (k_t / k) * (rp_t - rb_t)
//
//   Σ_t contribution_t = Rp - Rb     (reconciles exactly)
//
// When rp_t == rb_t the scaling factor takes its limit 1 / (1 + rp_t).

export interface Period {
  label: string; // e.g. "Q1"
  rp: number; // portfolio return for the period, %
  rb: number; // benchmark return for the period, %
}

export interface PeriodLink {
  label: string;
  rp: number;
  rb: number;
  arithmetic: number; // rp - rb, %
  factor: number; // Carino scaling factor k_t / k (dimensionless)
  linked: number; // Carino-linked contribution, %
  cumNaive: number; // running sum of arithmetic active through this period, %
  cumTrue: number; // compounded active return through this period, %
}

export interface LinkResult {
  periods: PeriodLink[];
  Rp: number; // compounded portfolio return, %
  Rb: number; // compounded benchmark return, %
  compoundedActive: number; // Rp - Rb, %
  naiveSum: number; // Σ arithmetic, %
  residual: number; // compoundedActive - naiveSum, %
  linkedSum: number; // Σ linked, % (== compoundedActive up to rounding)
}

/** Carino scaling coefficient for a return pair, with the rp == rb limit. */
function carinoCoeff(rp: number, rb: number): number {
  const a = rp / 100;
  const b = rb / 100;
  if (Math.abs(a - b) < 1e-9) return 1 / (1 + a);
  return (Math.log(1 + a) - Math.log(1 + b)) / (a - b);
}

/**
 * Link a sequence of single-period returns with Carino's algorithm. The
 * per-period `linked` contributions sum to the compounded active return; the
 * `arithmetic` figures (rp - rb) are kept alongside so the residual the linking
 * absorbs stays visible.
 */
export function link(periods: Period[]): LinkResult {
  let prodP = 1;
  let prodB = 1;
  for (const p of periods) {
    prodP *= 1 + p.rp / 100;
    prodB *= 1 + p.rb / 100;
  }
  const Rp = (prodP - 1) * 100;
  const Rb = (prodB - 1) * 100;
  const compoundedActive = Rp - Rb;
  const k = carinoCoeff(Rp, Rb);

  let cumP = 1;
  let cumB = 1;
  let cumNaive = 0;
  let naiveSum = 0;
  let linkedSum = 0;

  const linked: PeriodLink[] = periods.map((p) => {
    const arithmetic = p.rp - p.rb;
    const factor = carinoCoeff(p.rp, p.rb) / k;
    const linkedVal = arithmetic * factor;

    naiveSum += arithmetic;
    linkedSum += linkedVal;
    cumNaive += arithmetic;
    cumP *= 1 + p.rp / 100;
    cumB *= 1 + p.rb / 100;

    return {
      label: p.label,
      rp: p.rp,
      rb: p.rb,
      arithmetic,
      factor,
      linked: linkedVal,
      cumNaive,
      cumTrue: (cumP - cumB) * 100,
    };
  });

  return {
    periods: linked,
    Rp,
    Rb,
    compoundedActive,
    naiveSum,
    residual: compoundedActive - naiveSum,
    linkedSum,
  };
}

// ── Teaching scenarios ──────────────────────────────────────────────────────
// Four quarters of illustrative, synthetic portfolio/benchmark returns. The
// magnitude and dispersion of returns drive how large the linking residual
// grows, so the presets are chosen to range from "barely matters" to "matters
// a lot".

export interface LinkScenario {
  id: string;
  label: string;
  blurb: string;
  periods: Period[];
}

const Q = ["Q1", "Q2", "Q3", "Q4"];
const quarters = (rows: [number, number][]): Period[] =>
  rows.map(([rp, rb], i) => ({ label: Q[i], rp, rb }));

export const LINK_SCENARIOS: LinkScenario[] = [
  {
    id: "steady",
    label: "Steady alpha",
    blurb:
      "Small, consistent outperformance in a calm market. Returns are modest, so the residual is tiny — adding the quarters up almost works.",
    periods: quarters([
      [3.0, 2.5],
      [2.0, 1.6],
      [3.6, 3.2],
      [1.8, 1.3],
    ]),
  },
  {
    id: "swing",
    label: "Big-swing year",
    blurb:
      "Large up and down quarters. The same active returns, but big compounding makes the residual impossible to ignore.",
    periods: quarters([
      [12.0, 10.0],
      [-8.0, -7.0],
      [15.0, 13.0],
      [-5.0, -6.0],
    ]),
  },
  {
    id: "comeback",
    label: "Drawdown then recovery",
    blurb:
      "A sharp loss, then a rally. Active return earned inside the drawdown compounds differently from active return earned in the recovery.",
    periods: quarters([
      [-20.0, -18.0],
      [-9.0, -8.0],
      [18.0, 15.0],
      [12.0, 10.0],
    ]),
  },
  {
    id: "down",
    label: "Down-market alpha",
    blurb:
      "The manager beats the benchmark every quarter, but the market is negative all year — so compounding shrinks the reported edge.",
    periods: quarters([
      [-3.0, -5.0],
      [-2.0, -4.0],
      [-4.0, -6.0],
      [1.0, -1.0],
    ]),
  },
];

/** A scenario's periods are its shared state directly. */
export function buildLinkScenario(s: LinkScenario): Period[] {
  return s.periods.map((p) => ({ ...p }));
}

export const DEFAULT_PERIODS = buildLinkScenario(LINK_SCENARIOS[1]);

/** Identify which preset (if any) the current periods match, for highlighting. */
export function matchLinkScenario(periods: Period[]): string | null {
  const key = JSON.stringify(periods);
  const hit = LINK_SCENARIOS.find(
    (s) => JSON.stringify(buildLinkScenario(s)) === key,
  );
  return hit ? hit.id : null;
}
