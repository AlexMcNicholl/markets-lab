// Single source of truth for the tools on the site.
//
// Routes (main.tsx), the header nav (Layout.tsx), the home-page cards
// (Home.tsx), and each tool's page header (ToolPage.tsx) all read from this
// list. Adding a tool means: (1) add an entry here, (2) write its page
// component, (3) map the slug to that component in main.tsx. The nav, home
// grid, and page chrome update automatically and stay in sync.

export interface ToolMeta {
  /** URL slug, e.g. "yield-curve" → /yield-curve */
  slug: string;
  /** Two-digit index shown on the home card. */
  idx: string;
  /** Full title used on the tool page and home card. */
  title: string;
  /** Short label used in the header nav. */
  nav: string;
  /** One-paragraph description for the home card. */
  blurb: string;
  /** Italic one-liner shown at the foot of the home card. */
  takeaway: string;
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "attribution",
    idx: "01",
    title: "Attribution Playground",
    nav: "Attribution",
    blurb:
      "Move portfolio and benchmark weights and watch Brinson-Fachler allocation, selection, and interaction effects update live — then see why single-period effects don't sum across periods.",
    takeaway: "Where active return actually comes from.",
  },
  {
    slug: "manager-luck",
    idx: "02",
    title: "Skill vs. Luck",
    nav: "Skill vs. Luck",
    blurb:
      "Simulate a universe of managers with the skill you dial in, then read the leaderboard. Even with zero skill, someone beats the index five years running.",
    takeaway: "How long a track record has to be to mean anything.",
  },
  {
    slug: "yield-curve",
    idx: "03",
    title: "Yield Curve Sandbox",
    nav: "Yield Curve",
    blurb:
      "Reshape the Canada curve with steepener, flattener, and butterfly presets and reprice a bond portfolio through its key-rate durations.",
    takeaway: "Why where you sit on the curve is the whole trade.",
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
