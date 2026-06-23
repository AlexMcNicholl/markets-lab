// Black-Litterman asset allocation, self-contained.
//
// The mechanism, end to end: start from market-cap weights and *reverse* the
// optimizer to back out the excess returns the market is implicitly pricing
// (the equilibrium). Layer one or more directional views on top, each with a
// confidence, and blend them with the equilibrium to get posterior expected
// returns. Run those back through the optimizer and the weights tilt - by an
// amount that scales with how confident the view is. That tilt is the payoff
// the page reconciles, view by view.
//
// The universe, vols, and correlations are illustrative, broadly the shape of a
// global multi-asset book - not any real index or product. Returns are excess
// (over cash). Standard parameters: risk aversion δ = 2.5, scaling τ = 0.05
// (He & Litterman, 1999).

export interface Asset {
  id: string;
  name: string;
  short: string; // compact label for the chart
  vol: number; // annualized volatility, decimal
  w: number; // market-cap (equilibrium) weight, decimal - sum to 1
}

// Six asset classes, market weights summing to 1.00.
export const ASSETS: Asset[] = [
  { id: "us", name: "US Equity", short: "US Eq", vol: 0.16, w: 0.35 },
  { id: "idv", name: "Intl Developed Equity", short: "Dev Eq", vol: 0.17, w: 0.18 },
  { id: "em", name: "Emerging Mkt Equity", short: "EM Eq", vol: 0.22, w: 0.09 },
  { id: "gov", name: "Government Bonds", short: "Govt", vol: 0.06, w: 0.22 },
  { id: "corp", name: "Corporate Bonds", short: "Credit", vol: 0.08, w: 0.12 },
  { id: "gold", name: "Gold & Commodities", short: "Gold", vol: 0.18, w: 0.04 },
];

const ID_INDEX: Record<string, number> = Object.fromEntries(
  ASSETS.map((a, i) => [a.id, i]),
);

// Illustrative correlation matrix, same asset order. Equities cluster tightly,
// government bonds diversify them, credit sits between, gold is near-orthogonal.
const CORR: number[][] = [
  [1.0, 0.85, 0.75, -0.2, 0.2, 0.1],
  [0.85, 1.0, 0.8, -0.15, 0.25, 0.15],
  [0.75, 0.8, 1.0, -0.1, 0.3, 0.2],
  [-0.2, -0.15, -0.1, 1.0, 0.6, 0.1],
  [0.2, 0.25, 0.3, 0.6, 1.0, 0.15],
  [0.1, 0.15, 0.2, 0.1, 0.15, 1.0],
];

const DELTA = 2.5; // risk-aversion coefficient
const TAU = 0.05; // weight-on-the-prior scalar

// Covariance Σ_ij = ρ_ij · σ_i · σ_j (decimal²).
const SIGMA: number[][] = CORR.map((row, i) =>
  row.map((rho, j) => rho * ASSETS[i].vol * ASSETS[j].vol),
);

const N = ASSETS.length;

// A single view: a picking vector p over the assets and an expected excess
// return q. Relative views (p sums to 0) are funding-neutral long/short pairs;
// absolute views (one +1 leg) are outright. q is decimal.
export interface View {
  label: string; // plain-language statement, shown in the prose note
  p: Record<string, number>;
  q: number;
}

export interface BLPreset {
  id: string;
  label: string;
  blurb: string;
  views: View[];
}

// Three view sets plus an equilibrium baseline. Relative legs are split by
// relative market cap so the funding side is itself a sensible portfolio.
export const PRESETS: BLPreset[] = [
  {
    id: "em",
    label: "Bullish EM",
    blurb: "One relative view: emerging-market equity beats developed by 4%.",
    views: [
      {
        label: "Emerging-market equity outperforms developed equity by 4%",
        p: { em: 1, us: -0.66, idv: -0.34 },
        q: 0.04,
      },
    ],
  },
  {
    id: "riskoff",
    label: "Risk-off",
    blurb:
      "Two defensive views: government bonds and gold both beat the equity complex.",
    views: [
      {
        label: "Government bonds outperform the equity complex by 2.5%",
        p: { gov: 1, us: -0.565, idv: -0.29, em: -0.145 },
        q: 0.025,
      },
      {
        label: "Gold outperforms the equity complex by 3.5%",
        p: { gold: 1, us: -0.565, idv: -0.29, em: -0.145 },
        q: 0.035,
      },
    ],
  },
  {
    id: "rates",
    label: "Rates view",
    blurb:
      "A fixed-income relative-value call: credit beats government bonds as spreads compress.",
    views: [
      {
        label: "Corporate bonds outperform government bonds by 1.5% as spreads compress",
        p: { corp: 1, gov: -1 },
        q: 0.015,
      },
    ],
  },
  {
    id: "equilibrium",
    label: "Equilibrium",
    blurb: "No views at all - the posterior is the market portfolio. Baseline.",
    views: [],
  },
];

export function getPreset(id: string): BLPreset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

export interface AssetResult {
  id: string;
  name: string;
  short: string;
  wEq: number; // equilibrium weight, %
  piRet: number; // equilibrium (implied) excess return, %
  blRet: number; // Black-Litterman posterior return, %
  wPost: number; // posterior weight, % (renormalized to a fully-invested book)
  tilt: number; // active tilt vs. equilibrium, percentage points
}

export interface BLResult {
  assets: AssetResult[];
  leader: string; // id of the largest absolute tilt, for table highlight
  topOver: AssetResult; // largest overweight
  topUnder: AssetResult; // largest underweight
  activeRisk: number; // ex-ante tracking error of the tilt vs. equilibrium, %
  views: View[];
}

// ── small dense-matrix helpers ────────────────────────────────────────────
function matVec(A: number[][], x: number[]): number[] {
  return A.map((row) => row.reduce((s, v, j) => s + v * x[j], 0));
}

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const n = B[0].length;
  const k = B.length;
  const out = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let t = 0; t < k; t++) s += A[i][t] * B[t][j];
      out[i][j] = s;
    }
  return out;
}

function transpose(A: number[][]): number[][] {
  return A[0].map((_, j) => A.map((row) => row[j]));
}

// Gauss-Jordan inverse with partial pivoting. Inputs here are small and
// well-conditioned (positive-definite covariance, diagonal Ω), so this is plenty.
function invert(A: number[][]): number[][] {
  const n = A.length;
  const M = A.map((row, i) => [...row, ...row.map((_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const d = M[col][col];
    for (let j = 0; j < 2 * n; j++) M[col][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[col][j];
    }
  }
  return M.map((row) => row.slice(n));
}

// Map a 0–100 confidence onto the view-uncertainty scale. Ω = scale · diag(P·τΣ·Pᵀ):
// higher confidence shrinks Ω so the views pull harder, lower confidence loosens
// it back toward equilibrium. BASE keeps the default sweep in a believable active
// range, and the FLOOR caps the high-confidence end so unconstrained mean-variance
// can't lever a single view into a runaway position. An illustrative monotone
// mapping, not Idzorek's exact calibration.
const CONF_BASE = 8;
const CONF_FLOOR = 1.8;

function confidenceScale(confidence: number): number {
  const c = Math.min(95, Math.max(5, confidence)) / 100;
  return Math.max(CONF_FLOOR, (CONF_BASE * (1 - c)) / c);
}

/**
 * Run the Black-Litterman blend for a preset at a given confidence and return
 * the per-asset equilibrium → posterior reconciliation plus the headline tilts.
 */
export function runBL(preset: BLPreset, confidence: number): BLResult {
  const wEq = ASSETS.map((a) => a.w);
  // Equilibrium implied excess returns: Π = δ Σ w_mkt.
  const pi = matVec(SIGMA, wEq).map((v) => DELTA * v);

  let mu = pi;
  if (preset.views.length > 0) {
    const k = preset.views.length;
    const P: number[][] = preset.views.map((view) => {
      const row = Array(N).fill(0);
      for (const [id, val] of Object.entries(view.p)) row[ID_INDEX[id]] = val;
      return row;
    });
    const Q = preset.views.map((v) => [v.q]);
    const tauSigma = SIGMA.map((row) => row.map((v) => TAU * v));
    const scale = confidenceScale(confidence);

    // Ω = diag( scale · P·τΣ·Pᵀ ): each view's uncertainty proportional to the
    // prior variance of the bet it expresses.
    const PtauSigmaPt = matMul(matMul(P, tauSigma), transpose(P));
    const omegaInv = Array.from({ length: k }, (_, i) =>
      Array.from({ length: k }, (_, j) =>
        i === j ? 1 / (scale * PtauSigmaPt[i][i]) : 0,
      ),
    );

    // μ = [ (τΣ)⁻¹ + Pᵀ Ω⁻¹ P ]⁻¹ [ (τΣ)⁻¹ Π + Pᵀ Ω⁻¹ Q ]
    const tauSigmaInv = invert(tauSigma);
    const PtOmegaInv = matMul(transpose(P), omegaInv);
    const PtOmegaInvP = matMul(PtOmegaInv, P);
    const PtOmegaInvQ = matMul(PtOmegaInv, Q);
    const left = invert(
      tauSigmaInv.map((row, i) => row.map((v, j) => v + PtOmegaInvP[i][j])),
    );
    const tauSigmaInvPi = matVec(tauSigmaInv, pi);
    const rightMat = tauSigmaInvPi.map((v, i) => [v + PtOmegaInvQ[i][0]]);
    mu = matMul(left, rightMat).map((row) => row[0]);
  }

  // Posterior weights: w* = (δΣ)⁻¹ μ, renormalized to a fully-invested book so
  // the tilts net to zero and read as a pure active overlay.
  const sigmaInv = invert(SIGMA);
  const wRaw = matVec(sigmaInv, mu).map((v) => v / DELTA);
  const sum = wRaw.reduce((s, v) => s + v, 0);
  const wPost = wRaw.map((v) => v / sum);
  const tilt = wPost.map((v, i) => v - wEq[i]);

  const assets: AssetResult[] = ASSETS.map((a, i) => ({
    id: a.id,
    name: a.name,
    short: a.short,
    wEq: wEq[i] * 100,
    piRet: pi[i] * 100,
    blRet: mu[i] * 100,
    wPost: wPost[i] * 100,
    tilt: tilt[i] * 100,
  }));

  const leader = assets.reduce((a, b) =>
    Math.abs(b.tilt) > Math.abs(a.tilt) ? b : a,
  ).id;
  const topOver = assets.reduce((a, b) => (b.tilt > a.tilt ? b : a));
  const topUnder = assets.reduce((a, b) => (b.tilt < a.tilt ? b : a));

  // Ex-ante tracking error of the tilt: √(tiltᵀ Σ tilt), annualized %.
  const sigmaTilt = matVec(SIGMA, tilt);
  const variance = tilt.reduce((s, ti, i) => s + ti * sigmaTilt[i], 0);
  const activeRisk = Math.sqrt(Math.max(0, variance)) * 100;

  return { assets, leader, topOver, topUnder, activeRisk, views: preset.views };
}
