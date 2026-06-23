// Resampled efficient frontier (Michaud, 1998). The capital-market assumptions
// below are generic and illustrative - broadly the shape of a global multi-asset
// menu, but not a forecast or any real product. The whole point of the tool is
// the *instability* of mean-variance optimization under estimation error, not
// the specific numbers.

import { makeRng, normal } from "./stats";

export interface Asset {
  name: string; // full asset-class name
  short: string; // compact label
  mu: number; // expected annual return, %
  sigma: number; // annual volatility, %
}

export const TARGET = 6.5; // the return the optimizer is told to hit, %

export const ASSETS: Asset[] = [
  { name: "US Equity", short: "US Eq", mu: 7.5, sigma: 16 },
  { name: "Intl Equity", short: "Intl Eq", mu: 7.0, sigma: 18 },
  { name: "Emerging-Market Equity", short: "EM Eq", mu: 8.5, sigma: 22 },
  { name: "Government Bonds", short: "Bonds", mu: 3.0, sigma: 6 },
  { name: "Real Estate", short: "REITs", mu: 6.5, sigma: 19 },
];

// Correlation matrix, same order as ASSETS.
export const CORR: number[][] = [
  [1.0, 0.8, 0.7, -0.1, 0.6],
  [0.8, 1.0, 0.75, -0.05, 0.55],
  [0.7, 0.75, 1.0, 0.0, 0.5],
  [-0.1, -0.05, 0.0, 1.0, 0.1],
  [0.6, 0.55, 0.5, 0.1, 1.0],
];

const N = ASSETS.length;
const MU = ASSETS.map((a) => a.mu);
const SIGMA = ASSETS.map((a) => a.sigma);

// Covariance from correlation and vols: Σ_ij = σ_i σ_j ρ_ij.
function covariance(): number[][] {
  return CORR.map((row, i) => row.map((r, j) => SIGMA[i] * SIGMA[j] * r));
}

// ── Small linear-algebra helpers (N is 5, so naive versions are plenty) ──────

/** Invert a square matrix by Gauss-Jordan elimination with partial pivoting. */
function invert(m: number[][]): number[][] {
  const n = m.length;
  const a = m.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[piv][col])) piv = r;
    }
    [a[col], a[piv]] = [a[piv], a[col]];
    const d = a[col][col];
    for (let j = 0; j < 2 * n; j++) a[col][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = a[r][col];
      for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[col][j];
    }
  }
  return a.map((row) => row.slice(n));
}

function matVec(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}

/** Lower-triangular Cholesky factor L with L·Lᵀ = m. */
function cholesky(m: number[][]): number[][] {
  const n = m.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
      if (i === j) L[i][j] = Math.sqrt(Math.max(m[i][i] - sum, 1e-12));
      else L[i][j] = (m[i][j] - sum) / L[j][j];
    }
  }
  return L;
}

// ── Optimization ─────────────────────────────────────────────────────────────

/**
 * Minimum-variance portfolio that hits a target return: minimize wᵀΣw subject to
 * wᵀμ = target and wᵀ1 = 1. The closed-form solution is a blend of Σ⁻¹1 and
 * Σ⁻¹μ, so it always sums to one - but it stays unconstrained, free to short,
 * which is what makes its answer swing so hard when μ moves.
 *
 * `invOnes` (= Σ⁻¹1) and `A` (= 1ᵀΣ⁻¹1) depend only on Σ, so the caller
 * precomputes them once and passes them in.
 */
function frontierWeights(
  mu: number[],
  invCov: number[][],
  invOnes: number[],
  A: number,
  target: number,
): number[] {
  const invMu = matVec(invCov, mu); // Σ⁻¹μ
  const B = invOnes.reduce((s, _, i) => s + mu[i] * invOnes[i], 0); // 1ᵀΣ⁻¹μ
  const C = dot(mu, invMu); // μᵀΣ⁻¹μ
  const D = A * C - B * B;
  const g = (C - B * target) / D;
  const h = (A * target - B) / D;
  return invOnes.map((x, i) => g * x + h * invMu[i]);
}

export interface Point {
  risk: number; // annualized volatility, %
  ret: number; // annualized return, %
}

function moments(w: number[], mu: number[], cov: number[][]): Point {
  const variance = dot(w, matVec(cov, w));
  return { ret: dot(w, mu), risk: Math.sqrt(Math.max(variance, 0)) };
}

/** The true (unconstrained) efficient frontier, upper branch only, as a curve. */
function trueFrontier(mu: number[], cov: number[][]): Point[] {
  const inv = invert(cov);
  const ones = new Array(N).fill(1);
  const A = dot(ones, matVec(inv, ones));
  const B = dot(ones, matVec(inv, mu));
  const C = dot(mu, matVec(inv, mu));
  const D = A * C - B * B;
  const mGmv = B / A; // return of the global minimum-variance portfolio
  const pts: Point[] = [];
  for (let m = mGmv; m <= 10.0001; m += 0.2) {
    const variance = (A * m * m - 2 * B * m + C) / D;
    pts.push({ risk: Math.sqrt(Math.max(variance, 0)), ret: m });
  }
  return pts;
}

export interface AssetWeight {
  /** Weight from optimizing on the true inputs (the optimizer's confident bet). */
  textbook: number;
  /** Average weight across all resamples (the robust, "would-actually-hold" bet). */
  resampled: number;
  /** Range of the weight across resamples. */
  lo: number;
  hi: number;
}

export interface ResampleResult {
  cloud: Point[]; // each resample's portfolio, scored on the true inputs
  frontier: Point[]; // the true efficient frontier
  textbookPoint: Point; // optimizer's pick, on the true inputs
  resampledPoint: Point; // averaged portfolio, on the true inputs
  weights: AssetWeight[]; // per-asset reconciliation, weights as fractions
  topAsset: number; // index of the optimizer's largest position
  widest: number; // index of the asset whose weight swings most across runs
}

/**
 * Re-estimate expected returns `draws` times from `years` of (simulated) data,
 * re-optimize each time, and collect the cloud of "optimal" portfolios. Only the
 * means are re-estimated - they dominate the instability - while the covariance
 * is held at its true value. The mean estimate carries sampling error Σ/T, i.e.
 * a standard error of σ_i/√T per asset, so fewer years ⇒ a wider cloud.
 */
export function resampleFrontier(
  years: number,
  draws = 500,
  seed = 20250,
): ResampleResult {
  const cov = covariance();
  const inv = invert(cov);
  const L = cholesky(cov);
  const rng = makeRng(seed);
  const noise = 1 / Math.sqrt(years); // scales Σ → Σ/T for the mean estimate

  // Σ-only quantities, reused on every draw.
  const ones = new Array(N).fill(1);
  const invOnes = matVec(inv, ones);
  const A = dot(ones, invOnes);

  const textbookW = frontierWeights(MU, inv, invOnes, A, TARGET);

  const cloud: Point[] = [];
  const sumW = new Array(N).fill(0);
  const lo = new Array(N).fill(Infinity);
  const hi = new Array(N).fill(-Infinity);

  for (let b = 0; b < draws; b++) {
    const z = Array.from({ length: N }, () => normal(rng));
    const Lz = matVec(L, z);
    const muHat = MU.map((m, i) => m + noise * Lz[i]);
    const w = frontierWeights(muHat, inv, invOnes, A, TARGET);
    for (let i = 0; i < N; i++) {
      sumW[i] += w[i];
      if (w[i] < lo[i]) lo[i] = w[i];
      if (w[i] > hi[i]) hi[i] = w[i];
    }
    cloud.push(moments(w, MU, cov));
  }

  const avgW = sumW.map((s) => s / draws);

  const weights: AssetWeight[] = MU.map((_, i) => ({
    textbook: textbookW[i],
    resampled: avgW[i],
    lo: lo[i],
    hi: hi[i],
  }));

  let topAsset = 0;
  let widest = 0;
  for (let i = 1; i < N; i++) {
    if (textbookW[i] > textbookW[topAsset]) topAsset = i;
    if (hi[i] - lo[i] > hi[widest] - lo[widest]) widest = i;
  }

  return {
    cloud,
    frontier: trueFrontier(MU, cov),
    textbookPoint: moments(textbookW, MU, cov),
    resampledPoint: moments(avgW, MU, cov),
    weights,
    topAsset,
    widest,
  };
}
