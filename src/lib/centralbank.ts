// Central-Bank Tone Scoring — a transparent, dictionary-based hawkish/dovish
// score for monetary-policy statements. No model, no API: every statement is
// scored in the browser by matching a fixed lexicon of policy terms, the same
// lexicon approach that LLM tone classifiers are benchmarked against (in the
// spirit of Loughran-McDonald financial sentiment and the Apel-Blix-Grimaldi
// central-bank communication index).
//
// The statement excerpts below are VERBATIM quotations from the central banks'
// own published press releases (Bank of Canada and U.S. Federal Reserve) — both
// public-domain government communications. They are real bank data, not
// synthetic text; only the excerpting is ours.

export type Bank = "boc" | "fed";
export type Stance = "hawkish" | "dovish";

export const BANK_NAME: Record<Bank, string> = {
  boc: "Bank of Canada",
  fed: "Federal Reserve",
};

// ── Lexicon ──────────────────────────────────────────────────────────────────
// A hawkish term leans toward tighter policy / inflation concern; a dovish term
// leans toward easing / growth concern. Weights (1 mild → 3 an explicit policy
// signal) are matched longest-phrase-first so a specific phrase like
// "lower the target range" is scored once and never double-counted by the bare
// word inside it. The whole list is visible here and in the reconciling table —
// nothing is hidden in a model.
export interface LexiconEntry {
  phrase: string;
  stance: Stance;
  weight: number;
}

export const LEXICON: LexiconEntry[] = [
  // Hawkish — explicit tightening signals
  { phrase: "interest rates will need to rise further", stance: "hawkish", weight: 3 },
  { phrase: "ongoing increases", stance: "hawkish", weight: 3 },
  { phrase: "raise the target range", stance: "hawkish", weight: 3 },
  { phrase: "increased its target", stance: "hawkish", weight: 3 },
  { phrase: "rise further", stance: "hawkish", weight: 3 },
  // Hawkish — inflation-concern language
  { phrase: "strongly committed", stance: "hawkish", weight: 2 },
  { phrase: "more persistent", stance: "hawkish", weight: 2 },
  { phrase: "excess demand", stance: "hawkish", weight: 2 },
  { phrase: "remains elevated", stance: "hawkish", weight: 2 },
  { phrase: "remain elevated", stance: "hawkish", weight: 2 },
  { phrase: "well above", stance: "hawkish", weight: 2 },
  { phrase: "above-target", stance: "hawkish", weight: 2 },
  { phrase: "upward pressure", stance: "hawkish", weight: 2 },
  { phrase: "persistence", stance: "hawkish", weight: 2 },
  { phrase: "persistent", stance: "hawkish", weight: 2 },
  { phrase: "tight labour markets", stance: "hawkish", weight: 1 },
  { phrase: "tighter", stance: "hawkish", weight: 1 },
  { phrase: "robust", stance: "hawkish", weight: 1 },
  { phrase: "elevated", stance: "hawkish", weight: 1 },
  { phrase: "strengthen", stance: "hawkish", weight: 1 },
  { phrase: "widespread", stance: "hawkish", weight: 1 },

  // Dovish — explicit easing signals
  { phrase: "no longer needs to be as restrictive", stance: "dovish", weight: 3 },
  { phrase: "lower the target range", stance: "dovish", weight: 3 },
  { phrase: "reduced its target", stance: "dovish", weight: 3 },
  { phrase: "reduce the policy rate", stance: "dovish", weight: 3 },
  { phrase: "cut the policy rate", stance: "dovish", weight: 3 },
  // Dovish — easing / support language
  { phrase: "support economic growth", stance: "dovish", weight: 2 },
  { phrase: "support the flow of credit", stance: "dovish", weight: 2 },
  { phrase: "downward momentum", stance: "dovish", weight: 2 },
  { phrase: "greater confidence", stance: "dovish", weight: 2 },
  { phrase: "confidence that inflation", stance: "dovish", weight: 2 },
  { phrase: "progress toward", stance: "dovish", weight: 2 },
  { phrase: "moving sustainably", stance: "dovish", weight: 2 },
  { phrase: "easing", stance: "dovish", weight: 1 },
  { phrase: "eased", stance: "dovish", weight: 1 },
  { phrase: "declined", stance: "dovish", weight: 1 },
  { phrase: "decline", stance: "dovish", weight: 1 },
  { phrase: "slowed", stance: "dovish", weight: 1 },
  { phrase: "slow", stance: "dovish", weight: 1 },
  { phrase: "soft", stance: "dovish", weight: 1 },
  { phrase: "weigh on", stance: "dovish", weight: 1 },
  { phrase: "roughly in balance", stance: "dovish", weight: 1 },
  { phrase: "balance of risks", stance: "dovish", weight: 1 },
  { phrase: "moderated", stance: "dovish", weight: 1 },
  { phrase: "contracted", stance: "dovish", weight: 1 },
  { phrase: "edged up", stance: "dovish", weight: 1 },
  { phrase: "edged down", stance: "dovish", weight: 1 },
  { phrase: "weak", stance: "dovish", weight: 1 },
  { phrase: "support", stance: "dovish", weight: 1 },
];

// ── Statements (verbatim, public-domain) ─────────────────────────────────────
export type Action = "hike" | "hold" | "cut";

export interface Statement {
  id: string;
  bank: Bank;
  date: string; // short axis/button label, e.g. "Mar 2022"
  descriptor: string; // one-line context for the tooltip
  rate: string; // resulting policy rate
  action: Action;
  text: string; // verbatim excerpt
  source: string; // URL of the original press release
}

export const STATEMENTS: Record<Bank, Statement[]> = {
  boc: [
    {
      id: "boc-2022-03",
      bank: "boc",
      date: "Mar 2022",
      descriptor: "Liftoff — first hike of the cycle",
      rate: "0.50%",
      action: "hike",
      text: "The Bank of Canada today increased its target for the overnight rate to one half per cent. CPI inflation is currently at 5.1 per cent, as expected in January, and remains well above the Bank's target range. As the economy continues to expand and inflation pressures remain elevated, the Governing Council expects interest rates will need to rise further.",
      source: "https://www.bankofcanada.ca/2022/03/fad-press-release-2022-03-02/",
    },
    {
      id: "boc-2023-07",
      bank: "boc",
      date: "Jul 2023",
      descriptor: "Final hike — rate peaks at 5%",
      rate: "5.00%",
      action: "hike",
      text: "The Bank of Canada today increased its target for the overnight rate to 5 per cent. Global inflation is easing, with lower energy prices and a decline in goods price inflation, but robust demand and tight labour markets are causing persistent inflationary pressures in services. Underlying price pressures appear to be more persistent than anticipated. Excess demand and elevated core inflation are both proving more persistent.",
      source: "https://www.bankofcanada.ca/2023/07/fad-press-release-2023-07-12/",
    },
    {
      id: "boc-2024-01",
      bank: "boc",
      date: "Jan 2024",
      descriptor: "On hold, still guarding against inflation",
      rate: "5.00%",
      action: "hold",
      text: "The Bank of Canada today held its target for the overnight rate at 5 per cent. Global economic growth continues to slow, with inflation easing gradually across most economies. CPI inflation ended the year at 3.4 per cent. Shelter costs remain the biggest contributor to above-target inflation. The Council remains concerned about risks to the outlook for inflation, particularly the persistence in underlying inflation.",
      source: "https://www.bankofcanada.ca/2024/01/fad-press-release-2024-01-24/",
    },
    {
      id: "boc-2024-06",
      bank: "boc",
      date: "Jun 2024",
      descriptor: "First cut — the pivot to easing",
      rate: "4.75%",
      action: "cut",
      text: "The Bank of Canada today reduced its target for the overnight rate to 4.75 per cent. CPI inflation eased further in April, to 2.7 per cent. Three-month measures suggest continued downward momentum. With continued evidence that underlying inflation is easing, monetary policy no longer needs to be as restrictive. Governing Council has confidence that inflation will continue to move towards the 2 per cent target.",
      source: "https://www.bankofcanada.ca/2024/06/fad-press-release-2024-06-05/",
    },
    {
      id: "boc-2025-10",
      bank: "boc",
      date: "Oct 2025",
      descriptor: "Final cut of the cycle, to 2.25%",
      rate: "2.25%",
      action: "cut",
      text: "The Bank of Canada today reduced its target for the overnight rate to 2.25 per cent. Canada's economy contracted by 1.6 per cent in the second quarter, reflecting a drop in exports and weak business investment amid heightened uncertainty. CPI inflation was 2.4 per cent in September, slightly higher than the Bank had anticipated. With ongoing weakness in the economy and inflation expected to remain close to the 2 per cent target, Governing Council decided to cut the policy rate by 25 basis points.",
      source: "https://www.bankofcanada.ca/2025/10/fad-press-release-2025-10-29/",
    },
    {
      id: "boc-2026-06",
      bank: "boc",
      date: "Jun 2026",
      descriptor: "On hold at 2.25% amid an energy shock",
      rate: "2.25%",
      action: "hold",
      text: "The Bank of Canada today held its target for the overnight rate at 2.25 per cent. Economic activity in Canada has been weak and uncertainty about US trade policy persists. GDP edged down by 0.1 per cent in the first quarter, weaker than expected. The conflict in the Middle East is now in its fourth month, pushing up inflation. Consumer price inflation rose to 2.8 per cent in April, primarily from elevated oil prices.",
      source: "https://www.bankofcanada.ca/2026/06/fad-press-release-2026-06-10/",
    },
  ],
  fed: [
    {
      id: "fed-2022-03",
      bank: "fed",
      date: "Mar 2022",
      descriptor: "Liftoff — first hike of the cycle",
      rate: "0.25–0.50%",
      action: "hike",
      text: "Indicators of economic activity and employment have continued to strengthen. Job gains have been strong in recent months, and the unemployment rate has declined substantially. Inflation remains elevated, reflecting supply and demand imbalances related to the pandemic, higher energy prices, and broader price pressures. The Committee decided to raise the target range for the federal funds rate to 1/4 to 1/2 percent and anticipates that ongoing increases in the target range will be appropriate.",
      source: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20220316a.htm",
    },
    {
      id: "fed-2023-07",
      bank: "fed",
      date: "Jul 2023",
      descriptor: "Final hike — rate peaks at 5.25–5.50%",
      rate: "5.25–5.50%",
      action: "hike",
      text: "Recent indicators suggest that economic activity has been expanding at a moderate pace. Job gains have been robust in recent months, and the unemployment rate has remained low. Inflation remains elevated. Tighter credit conditions for households and businesses are likely to weigh on economic activity, hiring, and inflation. The Committee decided to raise the target range for the federal funds rate to 5-1/4 to 5-1/2 percent. The Committee is strongly committed to returning inflation to its 2 percent objective.",
      source: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20230726a.htm",
    },
    {
      id: "fed-2024-09",
      bank: "fed",
      date: "Sep 2024",
      descriptor: "First cut — a 50 bp pivot to easing",
      rate: "4.75–5.00%",
      action: "cut",
      text: "Recent indicators suggest that economic activity has continued to expand at a solid pace. Job gains have slowed, and the unemployment rate has moved up but remains low. Inflation has made further progress toward the Committee's 2 percent objective but remains somewhat elevated. The Committee has gained greater confidence that inflation is moving sustainably toward 2 percent, and judges that the risks to achieving its employment and inflation goals are roughly in balance. The Committee decided to lower the target range for the federal funds rate by 1/2 percentage point to 4-3/4 to 5 percent.",
      source: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm",
    },
    {
      id: "fed-2025-09",
      bank: "fed",
      date: "Sep 2025",
      descriptor: "Resumes cutting as labour risks rise",
      rate: "4.00–4.25%",
      action: "cut",
      text: "Recent indicators suggest that growth of economic activity moderated in the first half of the year. Job gains have slowed, and the unemployment rate has edged up but remains low. Inflation has moved up and remains somewhat elevated. The Committee decided to lower the target range for the federal funds rate by 1/4 percentage point to 4 to 4-1/4 percent in support of its goals and in light of the shift in the balance of risks.",
      source: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20250917a.htm",
    },
    {
      id: "fed-2025-12",
      bank: "fed",
      date: "Dec 2025",
      descriptor: "Third cut of the year, to 3.50–3.75%",
      rate: "3.50–3.75%",
      action: "cut",
      text: "Available indicators suggest that economic activity has been expanding at a moderate pace. Job gains have slowed this year, and the unemployment rate has edged up through September. Inflation has moved up since earlier in the year and remains somewhat elevated. The Committee decided to lower the target range for the federal funds rate by 1/4 percentage point to 3-1/2 to 3-3/4 percent.",
      source: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20251210a.htm",
    },
    {
      id: "fed-2026-04",
      bank: "fed",
      date: "Apr 2026",
      descriptor: "On hold at 3.50–3.75% amid an energy shock",
      rate: "3.50–3.75%",
      action: "hold",
      text: "Recent indicators suggest that economic activity has been expanding at a solid pace. Job gains have remained low, on average, and the unemployment rate has been little changed in recent months. Inflation is elevated, in part reflecting the recent increase in global energy prices. In considering the extent and timing of additional adjustments to the target range for the federal funds rate, the Committee will carefully assess incoming data, the evolving outlook, and the balance of risks.",
      source: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20260429a.htm",
    },
  ],
};

export function getStatement(id: string): Statement | undefined {
  return STATEMENTS.boc.concat(STATEMENTS.fed).find((s) => s.id === id);
}

// ── Scoring ──────────────────────────────────────────────────────────────────
export interface Hit {
  phrase: string;
  stance: Stance;
  weight: number;
  count: number;
  /** Signed contribution to net tone: +weight·count hawkish, −weight·count dovish. */
  contribution: number;
}

/** A run of the statement text, tagged with the stance it scored toward (if any). */
export interface Segment {
  text: string;
  stance?: Stance;
}

export interface Score {
  hawkish: number; // total weighted hawkish hits
  dovish: number; // total weighted dovish hits
  net: number; // hawkish − dovish (the reconciling total)
  /** Normalized −100 (fully dovish) … +100 (fully hawkish); 0 when no terms hit. */
  index: number;
  hits: Hit[]; // phrases that matched, strongest contribution first
  segments: Segment[]; // the full text, split for highlighting
}

const isWordChar = (ch: string | undefined) => !!ch && /[a-z0-9]/.test(ch);

/**
 * Score one statement against the lexicon. Phrases are matched longest-first and
 * each character of the text is consumed at most once, so a specific phrase and
 * the bare word inside it can never both score the same span.
 */
export function scoreStatement(text: string): Score {
  const lower = text.toLowerCase();
  const consumed = new Array(lower.length).fill(false);
  const spans: { start: number; end: number; stance: Stance }[] = [];
  const counts = new Map<string, number>();

  const ordered = [...LEXICON].sort((a, b) => b.phrase.length - a.phrase.length);
  for (const entry of ordered) {
    const p = entry.phrase;
    let from = 0;
    for (;;) {
      const i = lower.indexOf(p, from);
      if (i < 0) break;
      const end = i + p.length;
      from = i + 1;
      // Reject matches that sit inside a larger word.
      if (isWordChar(lower[i - 1]) || isWordChar(lower[end])) continue;
      // Reject matches overlapping an already-scored (longer) phrase.
      let free = true;
      for (let k = i; k < end; k++) if (consumed[k]) { free = false; break; }
      if (!free) continue;
      for (let k = i; k < end; k++) consumed[k] = true;
      spans.push({ start: i, end, stance: entry.stance });
      counts.set(p, (counts.get(p) ?? 0) + 1);
      from = end;
    }
  }

  const hits: Hit[] = LEXICON.filter((e) => counts.has(e.phrase)).map((e) => {
    const count = counts.get(e.phrase)!;
    const sign = e.stance === "hawkish" ? 1 : -1;
    return {
      phrase: e.phrase,
      stance: e.stance,
      weight: e.weight,
      count,
      contribution: sign * e.weight * count,
    };
  });
  hits.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const hawkish = hits
    .filter((h) => h.stance === "hawkish")
    .reduce((s, h) => s + h.contribution, 0);
  const dovish = -hits
    .filter((h) => h.stance === "dovish")
    .reduce((s, h) => s + h.contribution, 0);
  const total = hawkish + dovish;
  const net = hawkish - dovish;
  const index = total === 0 ? 0 : Math.round((net / total) * 100);

  // Build display segments from the (non-overlapping) scored spans.
  spans.sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let cursor = 0;
  for (const s of spans) {
    if (s.start > cursor) segments.push({ text: text.slice(cursor, s.start) });
    segments.push({ text: text.slice(s.start, s.end), stance: s.stance });
    cursor = s.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });

  return { hawkish, dovish, net, index, hits, segments };
}

/** Plain-language tone band from the normalized index. */
export function toneLabel(index: number): string {
  if (index >= 60) return "strongly hawkish";
  if (index >= 20) return "hawkish";
  if (index > -20) return "balanced";
  if (index > -60) return "dovish";
  return "strongly dovish";
}
