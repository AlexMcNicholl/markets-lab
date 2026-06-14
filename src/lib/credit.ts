// Credit spread decomposition (reduced-form).
//
// A corporate bond's yield is the risk-free rate for its maturity plus a credit
// spread. The spread itself splits into three things you're actually paid for:
//
//   expected loss     = PD · LGD             (the part you statistically lose)
//   credit risk prem. = (mult − 1) · EL      (paid to bear uncertain default)
//   liquidity premium = exogenous wedge      (paid for not being able to sell)
//
// PD is the physical (real-world) annual default probability and LGD the loss
// given default; `mult` is the default risk premium — the ratio of the
// risk-neutral hazard the market prices to the physical one, so the market
// charges several times the actuarial expected loss. Liquidity is the residual
// wedge observed on top. All figures are first-order and annualised: this is the
// intuition behind the credit-spread puzzle, not a pricing engine.

export interface CreditProfile {
  id: string;
  label: string;
  rating: string; // illustrative rating bucket, e.g. "BBB"
  blurb: string;
  riskFree: number; // matched-maturity government yield, %
  pd: number; // physical annual default probability, %
  lgd: number; // loss given default, fraction 0..1
  mult: number; // default risk premium (risk-neutral / physical hazard), ≥ 1
  liquidity: number; // liquidity premium, bps
}

export interface SpreadComponent {
  key: "el" | "rp" | "liq";
  label: string;
  /** The risk you bear to earn this slice — the "bet" behind the payoff. */
  compensates: string;
  bps: number;
  /** Share of the total credit spread, 0..1. */
  shareOfSpread: number;
}

export interface CreditResult {
  riskFree: number; // %
  creditSpreadBps: number;
  totalYield: number; // %, riskFree + spread
  components: SpreadComponent[]; // expected loss, risk premium, liquidity
}

// Illustrative profiles spanning the rating spectrum and two market regimes.
// Synthetic but plausible figures — broadly the shape of corporate spreads, not
// any real issuer or index.
export const PROFILES: CreditProfile[] = [
  {
    id: "ig-a",
    label: "Senior bank, A",
    rating: "A",
    blurb: "A high-grade senior bank bond. Default is remote; you're mostly paid to hold something a touch less liquid than a government bond.",
    riskFree: 4.0,
    pd: 0.06,
    lgd: 0.6,
    mult: 3.0,
    liquidity: 25,
  },
  {
    id: "ig-bbb",
    label: "Industrial, BBB",
    rating: "BBB",
    blurb: "The crossover line. Investment grade, but the spread is dominated by risk premium and illiquidity, not by expected loss.",
    riskFree: 4.0,
    pd: 0.25,
    lgd: 0.6,
    mult: 4.0,
    liquidity: 60,
  },
  {
    id: "hy-bb",
    label: "High yield, BB/B",
    rating: "BB",
    blurb: "Sub-investment-grade. Here expected default loss finally becomes a large slice of the spread you earn.",
    riskFree: 4.0,
    pd: 2.5,
    lgd: 0.65,
    mult: 2.2,
    liquidity: 120,
  },
  {
    id: "crisis",
    label: "IG in a crisis",
    rating: "BBB",
    blurb: "The same BBB credit during a market panic. The spread triples — almost entirely on risk premium and a frozen market, not on a higher chance of default.",
    riskFree: 1.0,
    pd: 0.30,
    lgd: 0.6,
    mult: 6.0,
    liquidity: 200,
  },
  {
    id: "private",
    label: "Private credit",
    rating: "B+",
    blurb: "A directly-originated loan you cannot trade. Decent credit, but the yield is carried by the liquidity premium for locking your money up.",
    riskFree: 4.0,
    pd: 1.0,
    lgd: 0.55,
    mult: 2.5,
    liquidity: 300,
  },
];

export const DEFAULT_PROFILE_ID = PROFILES[1].id; // BBB — the headline case

export function getProfile(id: string): CreditProfile {
  return PROFILES.find((p) => p.id === id) ?? PROFILES[1];
}

/** Decompose a profile's yield into the risk-free base and three spread slices. */
export function decompose(p: CreditProfile): CreditResult {
  const el = p.pd * p.lgd * 100; // PD(%) · LGD → bps
  const rp = (p.mult - 1) * el;
  const liq = p.liquidity;
  const spread = el + rp + liq;

  const components: SpreadComponent[] = [
    {
      key: "el",
      label: "Expected loss",
      compensates: "Defaults you'll statistically suffer (PD × LGD)",
      bps: el,
      shareOfSpread: spread ? el / spread : 0,
    },
    {
      key: "rp",
      label: "Credit risk premium",
      compensates: "Bearing uncertain, undiversifiable default risk",
      bps: rp,
      shareOfSpread: spread ? rp / spread : 0,
    },
    {
      key: "liq",
      label: "Liquidity premium",
      compensates: "Not being able to sell in size when you need to",
      bps: liq,
      shareOfSpread: spread ? liq / spread : 0,
    },
  ];

  return {
    riskFree: p.riskFree,
    creditSpreadBps: spread,
    totalYield: p.riskFree + spread / 100,
    components,
  };
}
