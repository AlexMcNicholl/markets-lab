// Single source of truth for the tools on the site.
//
// Routes (main.tsx), the header nav (Layout.tsx), the home-page cards and
// filter (Home.tsx), and each tool's page header (ToolPage.tsx) all read from
// this list. Adding a tool means: (1) add an entry here with a category,
// (2) write its page component, (3) map the slug to that component in
// main.tsx. Numbering, nav, the home grid, and the category filter all update
// automatically.

// Ordered list of project areas. Add a category here, then tag tools with it;
// the home-page filter shows a category only once at least one tool uses it.
export const CATEGORIES = [
  "Performance & Attribution",
  "Manager & Skill",
  "Rates & Fixed Income",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ToolMeta {
  /** URL slug, e.g. "yield-curve" → /yield-curve */
  slug: string;
  /** Project area, used for the home-page filter and card tag. */
  category: Category;
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
    category: "Performance & Attribution",
    title: "Attribution Playground",
    nav: "Attribution",
    blurb:
      "Move portfolio and benchmark weights and watch Brinson-Fachler allocation, selection, and interaction effects update live — then see why single-period effects don't sum across periods.",
    takeaway: "Where active return actually comes from.",
  },
  {
    slug: "manager-luck",
    category: "Manager & Skill",
    title: "Skill vs. Luck",
    nav: "Skill vs. Luck",
    blurb:
      "Simulate a universe of managers with the skill you dial in, then read the leaderboard. Even with zero skill, someone beats the index five years running.",
    takeaway: "How long a track record has to be to mean anything.",
  },
  {
    slug: "yield-curve",
    category: "Rates & Fixed Income",
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

/** Two-digit display number derived from list position (1-based). */
export function toolIndex(slug: string): string {
  const i = TOOLS.findIndex((t) => t.slug === slug);
  return String(i + 1).padStart(2, "0");
}
