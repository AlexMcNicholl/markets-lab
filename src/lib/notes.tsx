// Research notes — the one-page thesis behind each position in the Research
// Portfolio. The cockpit's position cards link here via `noteSlug`.
//
// Each note is the substance behind a cell: the view, the handful of variables
// it actually rides on, how the linked tool frames the valuation, and (pulled
// from the book itself, so it can't drift) what would change my mind. CNQ is
// written out in full as the template; the rest carry the same real structure
// with a tighter thesis and are flagged `stub` so it's honest about depth.
//
// Illustrative, public-data only. Not investment advice or a price target.

import { ReactNode } from "react";

export interface KeyVariable {
  label: string;
  detail: ReactNode;
}

export interface ResearchNote {
  slug: string;
  ticker: string;
  name: string;
  /** Registry slug of the tool that frames the valuation. */
  frameworkSlug: string;
  frameworkLabel: string;
  /** The view, in full prose (one or more paragraphs). */
  thesis: ReactNode;
  /** The handful of variables the thesis actually rides on. */
  keyVariables: KeyVariable[];
  /** How the linked tool frames the valuation / what it would take to be right. */
  valuation: ReactNode;
  /** True = structured stub (real skeleton, tighter thesis), not fully written. */
  stub?: boolean;
}

export const NOTES: ResearchNote[] = [
  {
    slug: "cnq",
    ticker: "CNQ.TO",
    name: "Canadian Natural Resources",
    frameworkSlug: "dcf-sensitivity",
    frameworkLabel: "DCF Sensitivity Explorer",
    thesis: (
      <>
        <p>
          The position is a bet that the market is discounting Canadian Natural's
          barrels at a crude tape it won't actually get. CNQ owns one of the
          longest-life, lowest-decline asset bases in the sector — synthetic and
          thermal oil reserves measured in decades, not the 30%-plus annual
          decline a shale operator has to outrun with capex. That structural
          edge is the whole argument: a low base decline means maintenance
          capital is modest, so a far larger share of cash flow is genuinely
          free, and free cash flow — not production growth — is what a mature
          energy name gets paid for.
        </p>
        <p>
          At the strip the market is implying, the free-cash-flow yield is in the
          low double digits, and management has been explicit and consistent
          about where that cash goes: net debt has been driven down to a level
          where the stated policy returns the bulk of free cash flow to
          shareholders through the base dividend (raised for two-plus decades
          running) and buybacks. The bear case is a crude price that stays soft
          into 2027; my read is that the forward curve is too bearish relative to
          a supply picture where U.S. shale growth is decelerating and OPEC+ is
          managing the barrel. I am being paid a high single-digit total cash
          return to hold the view while it plays out.
        </p>
        <p>
          This is a high-conviction, top-weight position precisely because the
          edge is structural rather than a call on next quarter's price — the
          decline-rate advantage doesn't depend on me being right about the tape
          in any given month. The risk I'm underwriting is the one in the kill
          criteria: a sustained move below roughly $60 WTI with no cost response,
          or any sign that the capital-return discipline is breaking.
        </p>
      </>
    ),
    keyVariables: [
      {
        label: "Base decline rate",
        detail:
          "The structural edge. Low single-to-double-digit corporate decline vs. 30%+ for shale means maintenance capex is low and FCF conversion high.",
      },
      {
        label: "WTI / WCS differential",
        detail:
          "The macro the thesis rides on. The position works if the forward curve is too bearish; the WCS heavy differential is the second-order Canadian risk.",
      },
      {
        label: "Capital-return policy",
        detail:
          "Post-deleveraging, the stated policy returns the majority of FCF via dividend + buyback. A cut would break the 'paid to wait' leg.",
      },
      {
        label: "Sustaining capital",
        detail:
          "What it costs to hold production flat. The lower this is, the more of the FCF yield is real rather than reinvestment in disguise.",
      },
    ],
    valuation: (
      <>
        Framed through the{" "}
        <span className="note-tool">DCF Sensitivity Explorer</span>: a two-stage
        free-cash-flow model where the question isn't a point estimate but{" "}
        <em>what crude path you have to believe</em> to justify the price. Run
        the bear lens and the market is pricing a sustained soft strip; the
        position is the wager that the discount rate and terminal assumptions
        baked into today's price are too punitive for an asset base this
        long-lived. Read the football field, not a number to the penny.
      </>
    ),
  },
  {
    slug: "csu",
    ticker: "CSU.TO",
    name: "Constellation Software",
    frameworkSlug: "comparable-companies",
    frameworkLabel: "Comparable Company Analysis",
    stub: true,
    thesis: (
      <p>
        A serial acquirer of vertical-market software businesses that compounds
        capital at high incremental returns by buying small, sticky,
        mission-critical software at disciplined multiples. The view is that the
        market keeps underwriting the decentralized acquisition engine on a
        trailing multiple while the reinvestment runway — now extended through
        spin-outs and larger deals — is longer than the multiple implies. You
        pay a premium headline multiple for a business whose real value is the
        capital-allocation machine, not this year's earnings.
      </p>
    ),
    keyVariables: [
      {
        label: "Capital deployed / year",
        detail: "The compounding engine — how much FCF gets reinvested into acquisitions.",
      },
      {
        label: "Return on invested capital",
        detail: "The hurdle the acquisition discipline defends. Multiple paid on deals vs. organic growth of the installed base.",
      },
      {
        label: "Organic growth",
        detail: "The quietly-watched line — VMS organic growth net of churn underpins the durability of the base.",
      },
    ],
    valuation: (
      <>
        Framed through{" "}
        <span className="note-tool">Comparable Company Analysis</span>: the comp
        set <em>is</em> the argument. Valued against generic software peers it
        looks expensive; valued against the handful of disciplined serial
        acquirers it screens differently. The exercise is showing how much of the
        implied price is the choice of peer.
      </>
    ),
  },
  {
    slug: "ry",
    ticker: "RY.TO",
    name: "Royal Bank of Canada",
    frameworkSlug: "comparable-companies",
    frameworkLabel: "Comparable Company Analysis",
    stub: true,
    thesis: (
      <p>
        The anchor financial: the largest Canadian bank, with a capital-markets
        and wealth franchise that earns a structurally higher return on equity
        than the domestic-lending peers it trades alongside. The view is modest
        and relative — RY deserves a premium price-to-book to the Big Six
        average it doesn't fully get, and the position is sized as a
        core-overweight rather than a high-conviction swing because the bank's
        fortunes are levered to a Canadian credit cycle I don't control.
      </p>
    ),
    keyVariables: [
      { label: "Return on equity", detail: "The premium justifier — ROE vs. the Big Six average." },
      { label: "Provisions for credit losses", detail: "The cycle risk — the line that turns a quality bank into a falling knife in a recession." },
      { label: "Common equity tier-1 ratio", detail: "Capital headroom for buybacks and dividend growth." },
    ],
    valuation: (
      <>
        Framed through{" "}
        <span className="note-tool">Comparable Company Analysis</span> on a
        price-to-book and price-to-earnings basis against the Big Six — the
        relative-value question of what premium the franchise quality earns.
      </>
    ),
  },
  {
    slug: "bn",
    ticker: "BN.TO",
    name: "Brookfield Corporation",
    frameworkSlug: "dcf-sensitivity",
    frameworkLabel: "DCF Sensitivity Explorer",
    stub: true,
    thesis: (
      <p>
        A sum-of-the-parts discount story: the market values Brookfield's listed
        affiliates and its asset-management stake, but assigns little to the
        carried interest accruing in the funds and the realisation value of the
        owned real assets. The view is that the discount to a conservative net
        asset value is too wide for a manager with this fee-bearing-capital
        growth. Sized medium because the NAV is genuinely hard to mark and the
        discount can persist.
      </p>
    ),
    keyVariables: [
      { label: "Fee-bearing capital growth", detail: "The annuity — what drives fee-related earnings." },
      { label: "Carried interest", detail: "The option value the market discounts hardest." },
      { label: "Discount to NAV", detail: "The entry edge — and the thing that can stay wide for years." },
    ],
    valuation: (
      <>
        Framed through the{" "}
        <span className="note-tool">DCF Sensitivity Explorer</span> as a
        plan-value build: discount the fee stream and net the owned capital. The
        sensitivity is to the discount rate applied to long-dated carry — exactly
        where the tool shows valuation is most fragile.
      </>
    ),
  },
  {
    slug: "wsp",
    ticker: "WSP.TO",
    name: "WSP Global",
    frameworkSlug: "dcf-sensitivity",
    frameworkLabel: "DCF Sensitivity Explorer",
    stub: true,
    thesis: (
      <p>
        A professional-services roll-up in engineering and environmental
        consulting, riding multi-year infrastructure and energy-transition
        spending. The view is that backlog visibility and a shift toward
        higher-margin advisory work support margin expansion the market is slow
        to capitalise, and that the acquisition cadence keeps compounding net
        revenue. A medium-conviction quality-growth holding, not a deep-value
        call.
      </p>
    ),
    keyVariables: [
      { label: "Backlog / book-to-bill", detail: "Forward revenue visibility." },
      { label: "EBITDA margin", detail: "The mix-shift thesis — advisory vs. lower-margin execution work." },
      { label: "Net revenue organic growth", detail: "Quality check on the roll-up." },
    ],
    valuation: (
      <>
        Framed through the{" "}
        <span className="note-tool">DCF Sensitivity Explorer</span> — the
        valuation rides on the terminal margin assumption, so the football field
        is wide on a half-point of margin.
      </>
    ),
  },
  {
    slug: "trp",
    ticker: "TRP.TO",
    name: "TC Energy",
    frameworkSlug: "yield-curve",
    frameworkLabel: "Yield Curve Sandbox",
    stub: true,
    thesis: (
      <p>
        A regulated, contracted pipeline business held for the yield and the
        rate-sensitivity it carries — the bond-proxy leg of the book. The view is
        that the de-leveraging post-spinoff plus largely take-or-pay cash flows
        make the dividend more durable than the rate-driven sell-off implied, and
        that the name re-rates as the curve stops repricing higher. Sized medium;
        it is explicitly a rates call as much as an equity one.
      </p>
    ),
    keyVariables: [
      { label: "Long-end yields", detail: "The discount-rate driver for a bond-proxy — the whole reason it's framed through the curve." },
      { label: "Contracted / regulated cash flow %", detail: "Durability of the distribution." },
      { label: "Debt / EBITDA", detail: "The de-leveraging path that protects the payout." },
    ],
    valuation: (
      <>
        Framed through the{" "}
        <span className="note-tool">Yield Curve Sandbox</span>: a regulated
        pipeline prices like a long-duration instrument, so what the long end
        does to the discount rate matters more than next year's volumes.
      </>
    ),
  },
  {
    slug: "fnv",
    ticker: "FNV.TO",
    name: "Franco-Nevada",
    frameworkSlug: "comparable-companies",
    frameworkLabel: "Comparable Company Analysis",
    stub: true,
    thesis: (
      <p>
        A gold-and-royalty streamer held as a deliberate low-conviction hedge,
        not a thesis I'd bet the book on: capital-light exposure to precious
        metals and commodity optionality that is negatively correlated with the
        energy and financial cyclicals doing the heavy lifting elsewhere. The
        size is small on purpose — it earns its place as ballast, and the premium
        royalty multiple is the cost of that insurance.
      </p>
    ),
    keyVariables: [
      { label: "Gold price", detail: "The macro driver — and the diversification the position is bought for." },
      { label: "Royalty / stream portfolio", detail: "Diversification and counterparty quality across mines." },
      { label: "Multiple vs. miners", detail: "The premium the capital-light model commands." },
    ],
    valuation: (
      <>
        Framed through{" "}
        <span className="note-tool">Comparable Company Analysis</span> against
        royalty/streaming peers — the premium-multiple question for a
        capital-light model.
      </>
    ),
  },
  {
    slug: "bce",
    ticker: "BCE.TO",
    name: "BCE Inc.",
    frameworkSlug: "credit-spreads",
    frameworkLabel: "Credit Spread Decomposition",
    stub: true,
    thesis: (
      <p>
        The honest problem child of the book. A high-yield telecom incumbent
        bought for the distribution and a stabilising competitive backdrop — and
        a position that has gone against me. The original view was that a
        levered, rate-sensitive name was oversold into the rate cycle and that
        wireless/wireline competition would rationalise; the price says the
        market is more worried about the balance sheet and the payout than I
        was. I'm holding it small and watching the kill criteria closely rather
        than averaging down on conviction I no longer fully have — the discipline
        the position is really testing is whether I respect my own sell rule.
      </p>
    ),
    keyVariables: [
      { label: "Dividend coverage (FCF payout)", detail: "The leg the thesis hangs on — and the one under most pressure." },
      { label: "Net debt / EBITDA", detail: "Leverage in a higher-rate world — the market's actual worry." },
      { label: "Wireless / wireline pricing", detail: "Whether competitive intensity rationalises or worsens." },
    ],
    valuation: (
      <>
        Framed through{" "}
        <span className="note-tool">Credit Spread Decomposition</span>: for a
        levered incumbent, what the bond market charges for the credit is the
        cleaner read on solvency risk than the equity's dividend yield — and
        right now it's the part of the thesis flashing.
      </>
    ),
  },
];

export function getNote(slug: string): ResearchNote | undefined {
  return NOTES.find((n) => n.slug === slug);
}
