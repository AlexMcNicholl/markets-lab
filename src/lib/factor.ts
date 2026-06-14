// Rolling Factor Attribution — decompose a manager's return stream into
// exposures to four standard factors (market, rates, credit, momentum), both
// over rolling 12-month windows (to expose style drift) and over the full
// period (a clean bet → payoff reconciliation). Whatever the factors can't
// explain is alpha.
//
// Everything is illustrative/synthetic. The factor return series is one fixed
// realization from a seeded PRNG so the page is reproducible; each preset is a
// manager archetype defined by a factor-loading path, a skill level (alpha),
// and idiosyncratic noise. No real fund, index, or factor library.

import { makeRng, normal } from "./stats";

export const FACTORS = ["Market", "Rates", "Credit", "Momentum"] as const;
export type FactorName = (typeof FACTORS)[number];

// Chart/line colour per factor, drawn from the site palette.
export const FACTOR_COLOR: Record<FactorName, string> = {
  Market: "#1f4a5c",
  Rates: "#b08433",
  Credit: "#2f6b80",
  Momentum: "#9b3a36",
};

export const MONTHS = 48;
export const YEARS = MONTHS / 12;
export const WINDOW = 18;

// Monthly factor returns (%). Means/vols are loosely calibrated to monthly
// long/short factor returns: a clear equity premium, modest positive rates and
// credit carry, a small momentum premium. Vols are kept high relative to
// idiosyncratic manager noise so an 18-month window can identify each loading
// cleanly — otherwise the rolling betas would be dominated by estimation noise.
interface FactorSpec {
  mean: number;
  vol: number;
}
const FACTOR_SPEC: Record<FactorName, FactorSpec> = {
  Market: { mean: 0.9, vol: 3.8 },
  Rates: { mean: 0.28, vol: 2.0 },
  Credit: { mean: 0.32, vol: 1.7 },
  Momentum: { mean: 0.35, vol: 2.6 },
};

function buildFactorReturns(): Record<FactorName, number[]> {
  const rng = makeRng(20240611);
  const out = {} as Record<FactorName, number[]>;
  for (const f of FACTORS) {
    const { mean, vol } = FACTOR_SPEC[f];
    out[f] = Array.from({ length: MONTHS }, () => mean + vol * normal(rng));
  }
  return out;
}

/** One fixed realization of the monthly factor returns, shared by every preset. */
export const FACTOR_RETURNS = buildFactorReturns();

// A factor loading is either constant or a linear path from start → end over
// the full track record — the latter is how a manager "drifts" into (or out
// of) a bet.
type Loading = number | { start: number; end: number };

export interface Manager {
  id: string;
  label: string;
  blurb: string;
  loadings: Partial<Record<FactorName, Loading>>;
  /** Monthly skill the factors can't explain (%). */
  alpha: number;
  /** Monthly idiosyncratic vol (%). */
  noise: number;
  seed: number;
}

// Five manager archetypes. Each tells a different "is this skill or exposure?"
// story; the default is the style drifter, the case the rolling view exists for.
export const MANAGERS: Manager[] = [
  {
    id: "drift",
    label: "Style drifter",
    blurb:
      "Started as a momentum-light, low-beta book and quietly drifted into a full-beta, anti-momentum stance. The average loading hides it; the rolling view doesn't.",
    loadings: {
      Market: { start: 0.3, end: 1.15 },
      Momentum: { start: 0.5, end: -0.45 },
      Rates: 0.2,
    },
    alpha: 0.08,
    noise: 0.6,
    seed: 44,
  },
  {
    id: "stock-picker",
    label: "Pure stock-picker",
    blurb:
      "Low, stable factor loadings and a steady skill premium — most of the return is genuinely unexplained by the factors.",
    loadings: { Market: 0.2, Momentum: 0.1 },
    alpha: 0.38,
    noise: 0.7,
    seed: 11,
  },
  {
    id: "closet",
    label: "Closet indexer",
    blurb:
      "A market beta of one and essentially no skill — the return is just the index in disguise, charged as active.",
    loadings: { Market: { start: 0.97, end: 1.0 } },
    alpha: 0.0,
    noise: 0.5,
    seed: 22,
  },
  {
    id: "rates",
    label: "Duration in disguise",
    blurb:
      "Looks like an equity manager, but the return is carried by a large, persistent rates bet — leveraged duration dressed as alpha.",
    loadings: { Market: 0.35, Rates: { start: 1.6, end: 2.0 }, Credit: 0.25 },
    alpha: 0.03,
    noise: 0.6,
    seed: 33,
  },
  {
    id: "credit",
    label: "Spread harvester",
    blurb:
      "Earns a steady return by sitting on credit-spread risk. In calm markets it reads as alpha — until spreads gap and the loading shows itself.",
    loadings: { Credit: { start: 1.4, end: 1.6 }, Market: 0.4, Rates: 0.3 },
    alpha: 0.0,
    noise: 0.55,
    seed: 55,
  },
];

export const DEFAULT_MANAGER = MANAGERS[0].id;

export function getManager(id: string): Manager {
  return MANAGERS.find((m) => m.id === id) ?? MANAGERS[0];
}

function loadingAt(l: Loading | undefined, t: number): number {
  if (l === undefined) return 0;
  if (typeof l === "number") return l;
  return l.start + (l.end - l.start) * (t / (MONTHS - 1));
}

/** Synthesize a manager's monthly return stream from its loading path + alpha. */
export function managerReturns(m: Manager): number[] {
  const rng = makeRng(m.seed);
  return Array.from({ length: MONTHS }, (_, t) => {
    let r = m.alpha;
    for (const f of FACTORS) r += loadingAt(m.loadings[f], t) * FACTOR_RETURNS[f][t];
    return r + m.noise * normal(rng);
  });
}

// ── Regression ──────────────────────────────────────────────────────────────

export interface Fit {
  intercept: number;
  beta: Record<FactorName, number>;
  r2: number;
}

// Solve a small linear system Ax = b by Gaussian elimination with partial
// pivoting. Dimensions here are ≤ 5, so this is plenty.
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / d;
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / (row[i] || 1e-12));
}

// Ordinary least squares of returns on the four factors plus an intercept (the
// alpha), via the normal equations (XᵀX)β = Xᵀy.
export function olsFit(y: number[], cols: Record<FactorName, number[]>): Fit {
  const n = y.length;
  const k = FACTORS.length + 1; // intercept + 4 factors
  const X: number[][] = y.map((_, i) => [1, ...FACTORS.map((f) => cols[f][i])]);

  const XtX = Array.from({ length: k }, () => Array(k).fill(0));
  const Xty = Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < k; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b = 0; b < k; b++) XtX[a][b] += X[i][a] * X[i][b];
    }
  }
  const coef = solve(XtX, Xty);

  const ybar = y.reduce((s, v) => s + v, 0) / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const pred = coef.reduce((s, c, j) => s + c * X[i][j], 0);
    ssRes += (y[i] - pred) ** 2;
    ssTot += (y[i] - ybar) ** 2;
  }

  const beta = {} as Record<FactorName, number>;
  FACTORS.forEach((f, j) => (beta[f] = coef[j + 1]));
  return { intercept: coef[0], beta, r2: ssTot > 0 ? 1 - ssRes / ssTot : 0 };
}

// ── Analysis ────────────────────────────────────────────────────────────────

export interface WindowPoint {
  /** Window end month, e.g. "M12". */
  label: string;
  month: number;
  beta: Record<FactorName, number>;
}

export interface Contribution {
  factor: FactorName;
  /** Full-period loading. */
  beta: number;
  /** Rolling beta in the first and last windows — the drift. */
  driftStart: number;
  driftEnd: number;
  /** Annualized factor return (%). */
  factorReturn: number;
  /** Annualized contribution to the manager's return (β × factor return, %). */
  contribution: number;
}

export interface Analysis {
  returns: number[];
  windows: WindowPoint[];
  contributions: Contribution[];
  /** Annualized figures (%), all reconciling: total = explained + alpha. */
  totalReturn: number;
  explained: number;
  alpha: number;
  /** Full-period R² — how much of the variance the four factors explain. */
  r2: number;
  /** Largest absolute contributor, and the largest loading swing. */
  topFactor: Contribution;
  topDrift: Contribution;
}

export function analyze(m: Manager): Analysis {
  const returns = managerReturns(m);

  // Rolling 12-month windows, each re-estimating the four loadings.
  const windows: WindowPoint[] = [];
  for (let end = WINDOW; end <= MONTHS; end++) {
    const ys = returns.slice(end - WINDOW, end);
    const cols = {} as Record<FactorName, number[]>;
    for (const f of FACTORS) cols[f] = FACTOR_RETURNS[f].slice(end - WINDOW, end);
    windows.push({ label: `M${end}`, month: end, beta: olsFit(ys, cols).beta });
  }

  // Full-period decomposition. By the OLS identity (residuals sum to zero), the
  // contributions plus alpha reconcile to the total return exactly.
  const full = olsFit(returns, FACTOR_RETURNS);
  const first = windows[0].beta;
  const last = windows[windows.length - 1].beta;

  const contributions: Contribution[] = FACTORS.map((f) => {
    const cumFactor = FACTOR_RETURNS[f].reduce((s, v) => s + v, 0);
    return {
      factor: f,
      beta: full.beta[f],
      driftStart: first[f],
      driftEnd: last[f],
      factorReturn: cumFactor / YEARS,
      contribution: (full.beta[f] * cumFactor) / YEARS,
    };
  });

  const totalReturn = returns.reduce((s, v) => s + v, 0) / YEARS;
  const explained = contributions.reduce((s, c) => s + c.contribution, 0);
  const alpha = totalReturn - explained; // = intercept × 12

  const topFactor = contributions.reduce((a, b) =>
    Math.abs(b.contribution) > Math.abs(a.contribution) ? b : a,
  );
  const topDrift = contributions.reduce((a, b) =>
    Math.abs(b.driftEnd - b.driftStart) > Math.abs(a.driftEnd - a.driftStart)
      ? b
      : a,
  );

  return {
    returns,
    windows,
    contributions,
    totalReturn,
    explained,
    alpha,
    r2: full.r2,
    topFactor,
    topDrift,
  };
}
