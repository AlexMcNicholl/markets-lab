// Illustrative historical shock estimates and portfolio templates for the
// Portfolio Stress Tester. Shock figures are approximate magnitudes for each
// asset class in each episode - not reconstructed from any specific index or fund.

export interface AssetClass {
  name: string;
  short: string;
}

export const ASSETS: AssetClass[] = [
  { name: "Global Equities", short: "Equities" },
  { name: "Long-Duration Bonds", short: "Bonds" },
  { name: "Invest.-Grade Credit", short: "Credit" },
  { name: "Real Estate", short: "REITs" },
  { name: "Commodities", short: "Commodities" },
  { name: "Cash", short: "Cash" },
];

export interface StressScenario {
  id: string;
  label: string;
  blurb: string;
  /** Asset name → approximate return during the episode (%). */
  shocks: Record<string, number>;
}

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: "gfc-2008",
    label: "GFC 2008",
    blurb:
      "Global Financial Crisis: broad equity collapse, credit freeze, commodity rout - bonds the only meaningful hedge.",
    shocks: {
      "Global Equities": -38,
      "Long-Duration Bonds": 12,
      "Invest.-Grade Credit": -10,
      "Real Estate": -40,
      Commodities: -35,
      Cash: 2,
    },
  },
  {
    id: "covid-2020",
    label: "COVID 2020",
    blurb:
      "March 2020 pandemic selloff: simultaneous equity and credit drawdown; long bonds partly absorbed the shock.",
    shocks: {
      "Global Equities": -34,
      "Long-Duration Bonds": 8,
      "Invest.-Grade Credit": -8,
      "Real Estate": -25,
      Commodities: -22,
      Cash: 1,
    },
  },
  {
    id: "rates-2022",
    label: "Rates 2022",
    blurb:
      "2022 inflation shock: bonds lost alongside equities - the equity-bond correlation flipped and neither side hedged the other.",
    shocks: {
      "Global Equities": -19,
      "Long-Duration Bonds": -25,
      "Invest.-Grade Credit": -15,
      "Real Estate": -26,
      Commodities: 20,
      Cash: 2,
    },
  },
  {
    id: "eurozone-2010",
    label: "Eurozone 2010",
    blurb:
      "European sovereign debt crisis: credit and peripheral equity stress; core long-duration bonds were bid as a flight-to-quality.",
    shocks: {
      "Global Equities": -15,
      "Long-Duration Bonds": 6,
      "Invest.-Grade Credit": -5,
      "Real Estate": -12,
      Commodities: -8,
      Cash: 1,
    },
  },
];

export interface StressPortfolio {
  id: string;
  label: string;
  blurb: string;
  /** Asset name → allocation (%). Must sum to 100. */
  weights: Record<string, number>;
}

export const PORTFOLIOS: StressPortfolio[] = [
  {
    id: "sixty-forty",
    label: "60/40 Classic",
    blurb:
      "60% global equities, 40% long-duration bonds - the canonical balanced mandate.",
    weights: {
      "Global Equities": 60,
      "Long-Duration Bonds": 40,
      "Invest.-Grade Credit": 0,
      "Real Estate": 0,
      Commodities: 0,
      Cash: 0,
    },
  },
  {
    id: "diversified",
    label: "Diversified",
    blurb:
      "Multi-asset spread: 40% equities, 25% bonds, 15% credit, 10% REITs, 5% commodities, 5% cash.",
    weights: {
      "Global Equities": 40,
      "Long-Duration Bonds": 25,
      "Invest.-Grade Credit": 15,
      "Real Estate": 10,
      Commodities: 5,
      Cash: 5,
    },
  },
  {
    id: "risk-on",
    label: "Risk-On",
    blurb:
      "Growth-tilted: 70% equities, 10% credit, 10% REITs, 5% commodities, 5% bonds.",
    weights: {
      "Global Equities": 70,
      "Long-Duration Bonds": 5,
      "Invest.-Grade Credit": 10,
      "Real Estate": 10,
      Commodities: 5,
      Cash: 0,
    },
  },
  {
    id: "risk-off",
    label: "Risk-Off",
    blurb:
      "Defensive: 20% equities, 50% bonds, 10% credit, 5% REITs, 5% commodities, 10% cash.",
    weights: {
      "Global Equities": 20,
      "Long-Duration Bonds": 50,
      "Invest.-Grade Credit": 10,
      "Real Estate": 5,
      Commodities: 5,
      Cash: 10,
    },
  },
];

export interface AssetResult {
  name: string;
  short: string;
  weight: number;
  shock: number;
  contribution: number;
}

export interface StressResult {
  assets: AssetResult[];
  total: number;
  /** Active asset with the most negative contribution. */
  worstAsset: AssetResult;
  /** Active asset with the most positive contribution. */
  bestAsset: AssetResult;
}

export function runStress(
  scenario: StressScenario,
  portfolio: StressPortfolio,
): StressResult {
  const assets: AssetResult[] = ASSETS.map((a) => {
    const weight = portfolio.weights[a.name] ?? 0;
    const shock = scenario.shocks[a.name] ?? 0;
    return {
      name: a.name,
      short: a.short,
      weight,
      shock,
      contribution: (weight * shock) / 100,
    };
  });

  const active = assets.filter((a) => a.weight > 0);
  const total = assets.reduce((s, a) => s + a.contribution, 0);

  const worstAsset = active.reduce((a, b) =>
    b.contribution < a.contribution ? b : a,
  );
  const bestAsset = active.reduce((a, b) =>
    b.contribution > a.contribution ? b : a,
  );

  return { assets, total, worstAsset, bestAsset };
}
