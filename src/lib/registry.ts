// Single source of truth for the projects on the site.
//
// Routes (main.tsx), the header nav (Layout.tsx), the home-page domain sections
// and filter (Home.tsx), and each project's page header (ToolPage.tsx) all read
// from this list. Adding a project means: (1) add an entry here with a category
// and status, (2) for a live tool, write its page component and map the slug in
// main.tsx (planned projects route to the shared ComingSoon stub automatically).
// Numbering, nav, the home grid, the domain sections, and the filter all update
// on their own.

// Ordered list of project domains. The home page renders one section per domain
// (in this order) and shows a domain in the filter only once it has a project.
export const CATEGORIES = [
  "Performance & Attribution",
  "Risk & Markets",
  "Portfolio Construction",
  "Manager Research",
  "AI & Markets",
  "Investment Banking",
  "Equity Research",
  "Debt Research",
] as const;

export type Category = (typeof CATEGORIES)[number];

// One-line descriptor shown under each domain heading on the home page.
export const CATEGORY_BLURBS: Record<Category, string> = {
  "Performance & Attribution": "Where return comes from — and whether it reconciles.",
  "Risk & Markets": "How prices move, and what moves with them.",
  "Portfolio Construction": "Turning views and constraints into weights.",
  "Manager Research": "Telling skill from luck in a track record.",
  "AI & Markets": "Language models pointed at market text.",
  "Investment Banking": "Valuation and the mechanics of a deal.",
  "Equity Research": "Fundamental analysis of single names.",
  "Debt Research": "Credit risk, spreads, and primary markets.",
};

export type Status = "live" | "planned";

export interface ToolMeta {
  /** URL slug, e.g. "yield-curve" → /yield-curve */
  slug: string;
  /** Project domain, used for the home sections, filter, and card tag. */
  category: Category;
  /** "live" tools have their own page; "planned" route to the ComingSoon stub. */
  status: Status;
  /** Full title used on the project page and home card. */
  title: string;
  /** Short label used in the header nav (live tools only). */
  nav: string;
  /** One-paragraph description for the home card and stub lede. */
  blurb: string;
  /** Italic one-liner shown at the foot of the home card. */
  takeaway: string;
}

export const TOOLS: ToolMeta[] = [
  // ── Performance & Attribution ─────────────────────────────────────────────
  {
    slug: "attribution",
    category: "Performance & Attribution",
    status: "live",
    title: "Attribution Playground",
    nav: "Attribution",
    blurb:
      "Move portfolio and benchmark weights and watch Brinson-Fachler allocation, selection, and interaction effects update live — then see why single-period effects don't sum across periods.",
    takeaway: "Where active return actually comes from.",
  },
  {
    slug: "multi-period-linking",
    category: "Performance & Attribution",
    status: "planned",
    title: "Multi-Period Linking",
    nav: "Linking",
    blurb:
      "Link single-period attribution across quarters with the Carino and Menchero algorithms, so the effects still reconcile to compounded performance instead of drifting apart.",
    takeaway: "Why attribution effects don't simply add up over time.",
  },

  // ── Risk & Markets ─────────────────────────────────────────────────────────
  {
    slug: "yield-curve",
    category: "Risk & Markets",
    status: "live",
    title: "Yield Curve Sandbox",
    nav: "Yield Curve",
    blurb:
      "Reshape the Canada curve with steepener, flattener, and butterfly presets and reprice a bond portfolio through its key-rate durations.",
    takeaway: "Why where you sit on the curve is the whole trade.",
  },
  {
    slug: "correlation-regimes",
    category: "Risk & Markets",
    status: "planned",
    title: "Correlation Regimes",
    nav: "Correlations",
    blurb:
      "Push a market from calm into stress and watch pairwise correlations converge toward one — the moment diversification quietly stops working, just when it's needed most.",
    takeaway: "Why diversification fails in a drawdown.",
  },

  // ── Portfolio Construction ───────────────────────────────────────────────
  {
    slug: "efficient-frontier",
    category: "Portfolio Construction",
    status: "live",
    title: "Resampled Efficient Frontier",
    nav: "Frontier",
    blurb:
      "Add estimation error to expected returns and watch the textbook frontier dissolve into a cloud of plausible answers — then resample it back into something you'd actually hold.",
    takeaway: "Why the optimizer's confidence is mostly noise.",
  },
  {
    slug: "currency-hedging",
    category: "Portfolio Construction",
    status: "planned",
    title: "Currency Hedging for Canadians",
    nav: "FX Hedging",
    blurb:
      "Dial the hedge ratio on a global book held in CAD and watch volatility, carry, and currency beta trade off against each other across different home-currency regimes.",
    takeaway: "How much of a foreign return is really the loonie.",
  },

  // ── Manager Research ─────────────────────────────────────────────────────
  {
    slug: "manager-luck",
    category: "Manager Research",
    status: "live",
    title: "Skill vs. Luck",
    nav: "Skill vs. Luck",
    blurb:
      "Simulate a universe of managers with the skill you dial in, then read the leaderboard. Even with zero skill, someone beats the index five years running.",
    takeaway: "How long a track record has to be to mean anything.",
  },
  {
    slug: "fundamental-law",
    category: "Manager Research",
    status: "planned",
    title: "Fundamental Law of Active Management",
    nav: "Fundamental Law",
    blurb:
      "Trade skill (information coefficient) against breadth and see why a mediocre forecaster making many independent bets can beat a guru who makes only a few.",
    takeaway: "IR ≈ IC × √breadth, made tangible.",
  },

  // ── AI & Markets ───────────────────────────────────────────────────────────
  {
    slug: "central-bank-tone",
    category: "AI & Markets",
    status: "live",
    title: "Central-Bank Tone Scoring",
    nav: "CB Tone",
    blurb:
      "Score real Bank of Canada and Federal Reserve statements on a hawkish-to-dovish scale with a transparent term lexicon, and track how the tone turns across the hike-and-cut cycle.",
    takeaway: "Turning policy language into a signal.",
  },
  {
    slug: "commentary-generator",
    category: "AI & Markets",
    status: "planned",
    title: "Fund Commentary Generator",
    nav: "Commentary",
    blurb:
      "Draft monthly fund commentary straight from performance and attribution data, with automatic checks that flag any claim the numbers don't actually support.",
    takeaway: "LLM drafting with a hallucination guardrail.",
  },

  // ── Investment Banking ────────────────────────────────────────────────────
  {
    slug: "dcf-sensitivity",
    category: "Investment Banking",
    status: "live",
    title: "DCF Sensitivity Explorer",
    nav: "DCF",
    blurb:
      "Flex WACC and terminal growth on a discounted-cash-flow model and watch the implied value — and the whole football field — swing on assumptions you can barely justify.",
    takeaway: "How much of a valuation is just the discount rate.",
  },
  {
    slug: "lbo-returns",
    category: "Investment Banking",
    status: "planned",
    title: "LBO Returns Sandbox",
    nav: "LBO",
    blurb:
      "Set leverage, entry and exit multiples, and the hold period, then decompose a sponsor's IRR into the three things that actually drive it.",
    takeaway: "Multiple expansion vs. deleveraging vs. growth.",
  },

  // ── Equity Research ───────────────────────────────────────────────────────
  {
    slug: "comparable-companies",
    category: "Equity Research",
    status: "live",
    title: "Comparable Company Analysis",
    nav: "Comps",
    blurb:
      "Value a company off its peers' EV/EBITDA, then watch the implied share price swing on the choice of comp set alone — by more than any model assumption.",
    takeaway: "Why the comp set is the whole argument.",
  },
  {
    slug: "earnings-drift",
    category: "Equity Research",
    status: "planned",
    title: "Earnings Surprise & Drift",
    nav: "Earnings Drift",
    blurb:
      "Sort names by earnings surprise and watch post-announcement drift play out — the decades-old anomaly that says the market doesn't price a surprise all at once.",
    takeaway: "Does the market really price earnings in a day?",
  },

  // ── Debt Research ─────────────────────────────────────────────────────────
  {
    slug: "credit-spreads",
    category: "Debt Research",
    status: "live",
    title: "Credit Spread Decomposition",
    nav: "Credit Spreads",
    blurb:
      "Pull a corporate bond's yield apart into the risk-free curve, the credit spread, and the slice that's really just compensation for not being able to sell it in size.",
    takeaway: "What you're actually paid for in a corporate bond.",
  },
  {
    slug: "new-issue-concession",
    category: "Debt Research",
    status: "planned",
    title: "New-Issue Concession",
    nav: "New Issues",
    blurb:
      "Price a new bond against the issuer's secondary curve and see how much extra yield — the new-issue concession — it takes to clear a primary deal as market tone shifts.",
    takeaway: "What it costs to bring a deal to market.",
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/** Two-digit display number derived from list position (1-based). */
export function toolIndex(slug: string): string {
  const i = TOOLS.findIndex((t) => t.slug === slug);
  return String(i + 1).padStart(2, "0");
}
