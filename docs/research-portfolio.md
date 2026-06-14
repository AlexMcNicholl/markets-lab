# Research Portfolio — "The Decision Cockpit"

> Status: **SPEC / DRAFT** (started 2026-06-14). Nothing built yet. This is the
> resume-tomorrow doc.

## One-line pitch

A model (synthetic-capital) portfolio that visualizes *why* each position exists —
thesis, conviction-weighted sizing, risk, and Brinson attribution on my own
decisions. The flagship "judgment" piece for the site. The loop the whole site has
been missing: **thesis → sized position → risk → attribution → outcome.**

## Why this exists (the brief, so I don't lose the thread)

Recruiter feedback: the site proves I can build the *machinery* but never shows me
*taking a view*. For a buy-side / PM track, the view is the product. This piece is
the judgment signal.

### The non-negotiable framing rule
**The wow is NOT the return number.** A synthetic track record impresses no one —
"of course the fake portfolio is up, you picked the entries." The wow is that it
looks like **an actual PM's internal tool**: every position visibly exists for a
reason, sized by conviction, with honest risk + attribution including the losers.

- Synthetic in **capital** (notional $1M paper book), real in **prices + reasoning**.
- **Dated entries** = can't backfill = credible.
- Label **"model / illustrative"** everywhere. No "my fund", no "aspiring PM" language
  (see CLAUDE.md positioning rules). Show judgment; don't narrate ambition.
- Public data only. Conflict-free. Sanity-check against Lysander personal-trading /
  social-media policy before anything goes live, even though it's synthetic.

---

## THE MOCK

### Overview / cockpit page (`/research-portfolio`)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  RESEARCH PORTFOLIO                                          model · illustrative│
│  A view, sized and tracked. Public data only.                  as of 14 Jun 2026│
│                                                                              │
│  Notional book $1,000,000        Positions 8 + cash        Since incept. ▸ —  │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│   EQUITY CURVE (model, illustrative)            CONTRIBUTION (since entry)     │
│   ┌──────────────────────────────┐      CNQ.TO   ████████▏  +1.8%            │
│   │                    ╱╲    ╱───│      GOOGL    ██████▏    +1.3%            │
│   │              ╱────╯  ╲╱      │      CASH     ██▏        +0.2%            │
│   │        ╱────╯               │      XIU.TO   ▏          +0.0%            │
│   │   ╱───╯                     │      …                                    │
│   │ ─╯                          │      RY.TO    ▏-0.4%  ▎                   │
│   └──────────────────────────────┘      TD.TO   ▏-0.9%  ▎▎                  │
│    incept. ──────────────► as of         (waterfall, winners + losers shown) │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────     │
│  ALLOCATION (GICS, vs benchmark)         RISK LENS                            │
│   Energy        ███████░░  18%  (+8)     Top-5 concentration   62%           │
│   Financials    █████░░░░  14%  (−3)     Equity beta (est.)    0.94          │
│   Info Tech     ██████░░░  16%  (+2)     Cash buffer           12%           │
│   …                                      Largest single name   11%  CNQ.TO   │
│   Cash          ████░░░░░  12%           # names               8             │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────     │
│  ATTRIBUTION — my decisions vs benchmark   (Brinson-Fachler · reuses lib)     │
│   Allocation effect    +0.6%   ▸ sector tilts                                │
│   Selection effect     +0.9%   ▸ names within sectors                        │
│   Interaction          −0.1%                                                  │
│   ───────────────────────────                                                │
│   Total active         +1.4%   → links to /attribution with this book loaded  │
└────────────────────────────────────────────────────────────────────────────┘

         [ POSITIONS ▾ ]   grid of position cards below ↓
```

### Position card (the senior-looking unit)

```
┌─────────────────────────────────────────────┐
│ CNQ.TO  Canadian Natural Resources           │
│ Energy · entered 12 Mar 2026                  │
│                                               │
│ "Best-in-class low-decline asset base; FCF    │
│  yield prices in a crude tape we think is too │
│  bearish into '27."                           │
│                                               │
│ Conviction  ████████░░  HIGH    Weight  11%   │
│ Entry $48.10   Mark $52.40   +8.9%            │
│                                               │
│ WHAT WOULD CHANGE MY MIND  ───────────────    │
│ • WTI sustained < $60 with no cost response   │
│ • Capital discipline breaks (buyback cut)     │
│                                               │
│ Framework ▸ DCF Sensitivity      Note ▸ read  │
└─────────────────────────────────────────────┘
```

- **"What would change my mind"** is the most senior thing on the page — keep it
  prominent, never optional.
- **Conviction** drives weight visibly (the card shows the link). Tie-in to the
  Black-Litterman mixer: conviction → position size is literally that tool's point.
- **Framework ▸** deep-links to whichever existing tool did the analysis (DCF for a
  stock, Yield Curve for a rates view, Credit for a bond, Comps for relative value).
- **Note ▸** opens the one-page thesis (research note = substance behind the cell).

---

## Data model (no backend — baked JSON, refreshed on deploy)

```ts
// src/lib/portfolio.ts (types) + src/data/portfolio.json (the book)
interface Position {
  ticker: string;          // "CNQ.TO"
  name: string;
  sector: GicsSector;      // full 11-sector GICS (finance-standards memory)
  thesisOneLiner: string;
  conviction: "high" | "medium" | "low";
  targetWeight: number;    // conviction-driven, sums (with cash) to 1
  entryDate: string;       // ISO — dated, no backfill
  entryPrice: number;
  currentPrice: number;    // marked at build time, "as of"
  killCriteria: string[];
  frameworkSlug: string;   // registry slug of the tool used
  noteSlug: string;        // links to the research note
}
interface Book {
  asOf: string;
  notionalCapital: number;
  cashWeight: number;
  benchmark: BenchmarkSpec;  // public index sector weights for Brinson
  positions: Position[];
}
```

- **Prices:** reuse the DCF tool's price sourcing (Yahoo chart endpoint via curl in
  sandbox → baked JSON). See memory `dcf-tool-data-sourcing`. Marks update when I
  rebuild/deploy; honest "as of" date. No client-side fetch (CORS).
- **Benchmark for attribution:** group by GICS sector; benchmark = sector weights of
  a recognized public index (e.g. S&P/TSX Composite or a 60/40 blend). Standard,
  synthetic-free. Feeds straight into existing `src/lib/attribution.ts`.
- **Equity curve:** mark each position from entry → asOf on real prices. Clearly
  labeled illustrative; it's real mark-to-market from a dated entry, not invented.

---

## How it reuses what already exists

| Need | Reuse |
|------|-------|
| Allocation/selection/interaction | `src/lib/attribution.ts` (Brinson-Fachler) |
| Conviction → weight narrative | Black-Litterman View Mixer (link/echo) |
| Per-name framework | DCF / Comps / Yield Curve / Credit tool pages |
| Equity curve / contribution charts | Recharts + existing chart components |
| Aesthetic | research-publication palette already in styles.css |

This is the integration that makes the site one coherent loop instead of a grid of
toys.

---

## Build plan (resume here tomorrow)

1. **[ ] Lock the mock** — confirm cockpit layout + card. (this doc)
2. **[ ] `src/lib/portfolio.ts`** — types + derived calcs (weights, drift, P&L
   contribution, mark-to-market). Pure, unit-testable, TS-strict.
3. **[ ] `src/data/portfolio.json`** — seed 6–8 positions across ≥4 GICS sectors,
   each with a real thesis + kill criteria + dated entry. Public names only.
4. **[ ] Wire attribution** — map the book + benchmark into `attribution.ts`,
   render the effects panel; deep-link to `/attribution` preloaded.
5. **[ ] `src/pages/ResearchPortfolio.tsx`** — cockpit (curve, contribution,
   allocation vs benchmark, risk lens, attribution) + position-card grid.
6. **[ ] Research notes** — one-page note per position (thesis, variables,
   valuation via the linked tool, kill criteria). Start with 1 fully-written note.
7. **[ ] Surface it** — featured block on Home (above the tools grid) + nav entry.
   Decide: new registry category vs. dedicated flagship route (see open questions).
8. **[ ] Price refresh path** — script/notes to re-mark on deploy (extend DCF
   sourcing). Document cadence (monthly is plenty; stale dated series looks worse
   than none).

## Open questions (decide before coding)

- **Placement:** flagship route hero-linked from Home, OR a 7th registry category
  ("Research Portfolio" / "Views")? Leaning flagship — it's not peer to the tools,
  it *uses* them.
- **Benchmark choice:** S&P/TSX Composite vs. a 60/40 multi-asset blend. Pick one
  recognized standard (finance-standards memory).
- **Cadence + "as of" honesty:** monthly re-mark? Define before publishing so it
  never looks abandoned.
- **# positions at launch:** enough to make attribution meaningful (≥6, ≥4 sectors)
  but each fully reasoned. Quality over count.

## Guardrails (don't violate)

- Label model/illustrative throughout; never "my fund" / real-money language.
- No "aspiring PM" / career-pitch copy (CLAUDE.md).
- Public/synthetic data only; no employer data, holdings, or figures.
- Process + attribution + honest losers is the credibility — not the return number.
