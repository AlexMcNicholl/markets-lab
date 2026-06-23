// Research notes - the one-page thesis behind each position in the Research
// Portfolio. The cockpit's position cards link here via `noteSlug`.
//
// Each note is the substance behind a cell: the view, the handful of variables
// it actually rides on, how the linked tool frames the valuation, and (pulled
// from the book itself, so it can't drift) what would change my mind. CNQ was
// the first written out in full; every note now carries the same structure —
// a multi-paragraph thesis, the handful of variables it rides on, and how the
// linked tool frames the valuation.
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
          longest-life, lowest-decline asset bases in the sector - synthetic and
          thermal oil reserves measured in decades, not the 30%-plus annual
          decline a shale operator has to outrun with capex. That structural
          edge is the whole argument: a low base decline means maintenance
          capital is modest, so a far larger share of cash flow is genuinely
          free, and free cash flow - not production growth - is what a mature
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
          edge is structural rather than a call on next quarter's price - the
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
    thesis: (
      <>
        <p>
          The position is a bet that the market keeps mis-pricing a
          capital-allocation machine as if it were a software company. What
          Constellation actually is, is a decentralised acquirer of small,
          sticky, mission-critical vertical-market software businesses - the kind
          of niche systems that run a municipal water utility or a marina, that
          cost almost nothing relative to the pain of ripping them out, and that
          churn at low single digits for decades. The edge is not any single
          product; it is the discipline of buying hundreds of these at sensible
          multiples and pushing the cash they throw off back into the next batch.
          That is a reinvestment engine, and the only number that matters for an
          engine is the return it earns on what you feed it.
        </p>
        <p>
          The reason the view exists is a duration mismatch. The market
          capitalises this year's earnings on a trailing multiple; the real asset
          is a long runway of high-return reinvestment that the trailing multiple
          can't see, because it shows up only as next year's deals. Management has
          deliberately widened that runway - larger deals, the willingness to
          spin out platforms (Topicus, Lumine) so each can compound on its own
          balance sheet, and a culture that treats hurdle-rate discipline as
          religion rather than guidance. So long as capital keeps going out the
          door at returns well above the cost of capital, the headline multiple
          understates the business; the moment deployment stalls or returns
          compress, the premium is unjustified and the stock is just expensive
          software.
        </p>
        <p>
          It is a high-conviction, top-weight holding because the edge is the
          process, not a forecast - I don't need to be right about any single
          acquisition, only about the machine's continued ability to find and
          underwrite them. The risk I'm underwriting is the one in the kill
          criteria: deployment that stalls for several quarters, returns drifting
          toward the cost of capital, or organic VMS growth turning persistently
          negative net of churn - any of which would mean the runway has run out,
          not narrowed.
        </p>
      </>
    ),
    keyVariables: [
      {
        label: "Capital deployed / year",
        detail:
          "The fuel for the engine. The thesis is about reinvestment, so the dollars going into acquisitions each year - and whether the pace holds as the base grows - is the line that confirms or kills the runway argument.",
      },
      {
        label: "Return on invested capital",
        detail:
          "The hurdle the whole premium rests on. The spread between what deals earn and the cost of capital is the value created; if it compresses toward the cost of capital, the compounding stops and the multiple is wrong.",
      },
      {
        label: "Organic VMS growth",
        detail:
          "The quiet durability check. Net of churn, organic growth tells you the acquired base isn't quietly melting - it's the difference between compounding on a stable foundation and running on a treadmill.",
      },
      {
        label: "Multiple paid on acquisitions",
        detail:
          "Discipline, made visible. Rising prices paid for deals would erode the return on deployed capital even if the pace looks healthy - the engine can be busy and still destroy value.",
      },
    ],
    valuation: (
      <>
        Framed through{" "}
        <span className="note-tool">Comparable Company Analysis</span>: here the
        comp set <em>is</em> the argument. Screened against generic software
        peers, Constellation looks expensive on every headline multiple; screened
        against the short list of disciplined serial acquirers - businesses whose
        value is the redeployment of cash, not the growth of a single product —
        it screens differently. The exercise is to show how much of the price you
        observe is really a choice of peer group, and to make explicit that the
        premium is paying for the capital-allocation machine, not for next year's
        EPS.
      </>
    ),
  },
  {
    slug: "ry",
    ticker: "RY.TO",
    name: "Royal Bank of Canada",
    frameworkSlug: "comparable-companies",
    frameworkLabel: "Comparable Company Analysis",
    thesis: (
      <>
        <p>
          The position is the anchor financial in the book, and the view is
          deliberately modest: the largest Canadian bank earns a structurally
          higher return on equity than the Big Six average, but the market grants
          it only a partial premium to that average on price-to-book. The reason
          the ROE is higher is mix, not leverage - Royal's earnings lean more on
          capital-markets and wealth management, businesses that consume less
          balance sheet per dollar of profit than plain domestic lending. A bank
          that earns a higher, more capital-efficient ROE deserves to trade at a
          wider multiple of book; the gap between the premium it earns and the
          premium it's granted is the edge.
        </p>
        <p>
          This is sized as a core overweight rather than a high-conviction swing
          for an honest reason: the entire Canadian bank complex is levered to a
          credit cycle I don't control. The single line that decides whether the
          year is good or ugly is provisions for credit losses, and that turns on
          the Canadian consumer, housing, and the path of rates - none of which
          is a Royal-specific call. So the thesis is relative, not absolute. I am
          not betting that bank earnings go up; I am betting that within a sector
          I want some exposure to, the best franchise is the one to own, and that
          its quality is under-priced relative to peers.
        </p>
      </>
    ),
    keyVariables: [
      {
        label: "Return on equity vs. the Big Six",
        detail:
          "The justifier for the premium. The whole relative-value case is that a structurally higher, more capital-efficient ROE should command a wider price-to-book than the peer average - so the spread between Royal's ROE and the group's is the variable that earns the multiple.",
      },
      {
        label: "Provisions for credit losses",
        detail:
          "The cycle risk that overrides everything. PCLs are the line that turns a quality bank into a falling knife in a downturn - and the part of the outcome least within the franchise's control.",
      },
      {
        label: "CET1 ratio",
        detail:
          "Capital headroom, and optionality. A strong common-equity tier-1 ratio funds buybacks and dividend growth and provides the cushion that lets a bank lean into a downturn rather than retrench - the difference between a defensive holding and a fragile one.",
      },
    ],
    valuation: (
      <>
        Framed through{" "}
        <span className="note-tool">Comparable Company Analysis</span> on
        price-to-book and price-to-earnings against the rest of the Big Six. For
        a bank, book value is the cleaner anchor than a cash-flow model, and the
        relevant question is purely relative: what premium-to-book does the
        franchise quality actually earn, and how much of that is already in the
        price? The comp screen makes the gap - earned ROE premium versus granted
        valuation premium - explicit, which is the entire basis of the position.
      </>
    ),
  },
  {
    slug: "bn",
    ticker: "BN.TO",
    name: "Brookfield Corporation",
    frameworkSlug: "dcf-sensitivity",
    frameworkLabel: "DCF Sensitivity Explorer",
    thesis: (
      <>
        <p>
          The position is a sum-of-the-parts discount story. Brookfield's value
          is built from a few distinct blocks - a stake in a listed
          asset-management business, a large book of owned real assets
          (infrastructure, renewables, real estate, an insurance balance sheet),
          and the carried interest accruing inside the funds it runs. The market
          is comfortable pricing the visible blocks: the listed affiliates and
          the fee stream you can see today. It is far less comfortable paying for
          the two that require trust - the realisation value of the owned capital,
          which gets marked conservatively or not at all, and the carry, which is
          a call option on the future performance of funds that haven't been
          harvested yet. The result is a holding-company discount to a defensible
          net asset value that I think is too wide for a franchise growing
          fee-bearing capital at this rate.
        </p>
        <p>
          The engine underneath is the annuity: every dollar of new fee-bearing
          capital raised locks in a multi-year stream of management fees that
          doesn't depend on markets cooperating. On top of that sits the carry —
          genuinely option-like, worth little if funds underperform and a great
          deal if they don't, which is exactly why the market discounts it
          hardest. My view is not that the discount is irrational; it is that it
          is wider than a conservative mark on the owned capital plus a modest
          value for the carry can justify, and that the gap closes as
          realisations validate the marks.
        </p>
        <p>
          It is sized medium, not top-weight, with eyes open. The NAV is honestly
          hard to mark - that opacity is the source of the discount and also the
          reason it can persist for years regardless of how the underlying does.
          The kill criteria are the discipline here: fee-bearing capital growth
          stalling, realisations that disappoint and so vindicate the market's
          skepticism, or a discount that widens rather than closes over my
          horizon. A cheap thing that stays cheap is not an edge.
        </p>
      </>
    ),
    keyVariables: [
      {
        label: "Fee-bearing capital growth",
        detail:
          "The annuity at the core. New fee-bearing capital locks in years of management fees independent of the market, so its growth is the single best read on whether the durable, easy-to-value part of the business is compounding.",
      },
      {
        label: "Carried interest",
        detail:
          "The option the market discounts hardest. Carry is worth little if funds underperform and a lot if they don't - most of the disputed value sits here, which is why realisations matter so much.",
      },
      {
        label: "Realisations / marks on owned capital",
        detail:
          "The proof of the pudding. Asset sales at or above carrying value are what turn a conservative NAV into a credible one and give the market a reason to narrow the discount.",
      },
      {
        label: "Discount to NAV",
        detail:
          "The entry edge - and the trap. A wide discount is the reason to own it, but a discount that refuses to close is also the way the thesis quietly fails. Direction over the horizon matters as much as the starting level.",
      },
    ],
    valuation: (
      <>
        Framed through the{" "}
        <span className="note-tool">DCF Sensitivity Explorer</span> as a
        plan-value build rather than a single point estimate: discount the fee
        stream as a long-duration annuity, add a conservative value for the
        carry, and net it against the owned capital. The sensitivity that
        dominates is the discount rate applied to long-dated, option-like carry —
        precisely the corner of the model the tool shows is most fragile, where a
        half-point on the rate or a year on the horizon swings the answer. The
        point is to read the range and ask whether today's discount is wider than
        even the conservative end of it.
      </>
    ),
  },
  {
    slug: "wsp",
    ticker: "WSP.TO",
    name: "WSP Global",
    frameworkSlug: "dcf-sensitivity",
    frameworkLabel: "DCF Sensitivity Explorer",
    thesis: (
      <>
        <p>
          The position is a quality-growth bet on a professional-services
          roll-up. WSP sells engineering and environmental consulting - design,
          advisory, and project work that rides multi-year, politically durable
          spending on infrastructure, water, transport, and the energy
          transition. The demand backdrop is the easy part; the more interesting
          part is the mix. As the work shifts from lower-margin execution toward
          higher-margin advisory and front-end design, the blended EBITDA margin
          should grind higher - and my view is that the market is slow to
          capitalise margin expansion that is gradual and mix-driven rather than
          a step-change it can point to in a single quarter.
        </p>
        <p>
          Layered on top is the roll-up itself. The business compounds net
          revenue by acquiring regional consultancies and folding them into a
          global platform, and the cadence has been consistent enough to treat as
          a repeatable source of growth rather than a one-off. The combination —
          visible backlog, a structural margin tailwind, and a disciplined
          acquisition machine - is what justifies paying a quality multiple. This
          is explicitly not a deep-value call; I am paying up for a compounder and
          betting the compounding outlasts the multiple.
        </p>
        <p>
          It is sized medium because each leg has a soft spot. Backlog protects
          the revenue but not the margin; the mix-shift is real but slow and can
          stall; and a roll-up only works while the acquired revenue grows
          organically rather than papering over a melting base. The kill criteria
          track exactly those failure modes - book-to-bill slipping below 1,
          margin expansion stalling, or the acquisition cadence slowing without
          organic growth to replace it.
        </p>
      </>
    ),
    keyVariables: [
      {
        label: "Backlog / book-to-bill",
        detail:
          "Forward revenue visibility. Book-to-bill above 1 means the pipeline is filling faster than it's drained - the leading indicator that the infrastructure-spend tailwind is still blowing.",
      },
      {
        label: "EBITDA margin",
        detail:
          "The heart of the thesis. The whole edge is that the shift toward higher-margin advisory work lifts the blended margin faster than the market expects - a half-point here moves the valuation more than a quarter of revenue does.",
      },
      {
        label: "Net revenue organic growth",
        detail:
          "The quality check on the roll-up. Strip out acquisitions and this tells you whether the platform is genuinely growing or just buying revenue to mask a flat base.",
      },
      {
        label: "Acquisition cadence",
        detail:
          "The compounding lever. A steady pace of sensibly-priced deals is what extends the growth runway; a slowdown without offsetting organic growth is the signal the model has run out of room.",
      },
    ],
    valuation: (
      <>
        Framed through the{" "}
        <span className="note-tool">DCF Sensitivity Explorer</span>: for a
        consultancy, the valuation rides overwhelmingly on the terminal margin
        assumption, because a steady-state advisory mix earns a meaningfully
        different margin than today's blend. That makes the football field wide
        on a single half-point of terminal margin - so the question the tool
        forces is not "what is it worth" but "how much margin expansion do I have
        to believe is durable to justify the price," and whether the mix-shift
        evidence supports that belief.
      </>
    ),
  },
  {
    slug: "trp",
    ticker: "TRP.TO",
    name: "TC Energy",
    frameworkSlug: "yield-curve",
    frameworkLabel: "Yield Curve Sandbox",
    thesis: (
      <>
        <p>
          The position is the bond-proxy leg of the book, and it is an honest
          rates call dressed as an equity. TC Energy is a regulated, largely
          contracted pipeline business: most of its cash flow comes from
          take-or-pay and regulated tolls, where the customer pays for capacity
          whether the gas flows or not. Cash flow that durable and that
          long-dated behaves like a long bond - its present value is dominated by
          the discount rate, which means the share price has been beaten up less
          by anything operational than by the back-up in long-end yields. The view
          is that the rate-driven sell-off over-discounted a distribution that is
          considerably more secure than the price implies.
        </p>
        <p>
          The second leg is balance-sheet repair. Post-spinoff, the business has
          been on a de-leveraging path, and a falling debt/EBITDA is what protects
          the payout and removes the tail risk that a stressed balance sheet
          forces a distribution cut at the worst possible moment. Combine durable,
          contracted cash flow with a de-risking balance sheet and you have a
          payout that should re-rate higher - i.e. a lower yield, a higher price —
          when the long end stops repricing upward. I am collecting the
          distribution while I wait for the rate environment to cooperate.
        </p>
        <p>
          It is sized medium and held with no illusions: this is as much a bet on
          the curve as on the company, and I don't control the curve. The kill
          criteria are framed accordingly - long-end yields grinding structurally
          higher (which would keep repricing the discount rate against me), a
          de-leveraging path that slips, or a project overrun or adverse
          regulatory ruling that impairs the contracted cash flow the whole
          bond-proxy framing depends on.
        </p>
      </>
    ),
    keyVariables: [
      {
        label: "Long-end yields",
        detail:
          "The discount-rate driver, and the whole reason this is framed through the curve. A long-duration, bond-like cash flow stream rises and falls with the back end of the curve far more than with next year's volumes.",
      },
      {
        label: "Contracted / regulated cash-flow share",
        detail:
          "The durability of the distribution. The higher the take-or-pay and regulated portion, the more bond-like - and the more defensible - the payout, which is what justifies pricing it off the curve at all.",
      },
      {
        label: "Debt / EBITDA",
        detail:
          "The de-leveraging path that protects the payout. A falling leverage ratio removes the risk that a stretched balance sheet forces a cut, and is the operational half of the re-rating case.",
      },
    ],
    valuation: (
      <>
        Framed through the{" "}
        <span className="note-tool">Yield Curve Sandbox</span>: a regulated
        pipeline prices like a long-duration instrument, so the relevant lever is
        what the long end does to the discount rate, not what next year's
        throughput does to volumes. The tool makes that duration intuition
        concrete - a move at the back of the curve flows straight into the present
        value of a contracted cash-flow stream - which is exactly why I treat the
        position's fortunes as a rates call and size it as one.
      </>
    ),
  },
  {
    slug: "fnv",
    ticker: "FNV.TO",
    name: "Franco-Nevada",
    frameworkSlug: "comparable-companies",
    frameworkLabel: "Comparable Company Analysis",
    thesis: (
      <>
        <p>
          The position is a deliberate low-conviction hedge, and I want to be
          explicit that it is held for its correlation, not its upside. Franco-
          Nevada is a gold-and-royalty streamer: it finances mines in exchange for
          a cut of future production, which gives it capital-light exposure to
          precious-metals prices without the cost inflation, capex blowouts, and
          single-mine operating risk that make the miners themselves so painful to
          own. What earns its place in the book is that this exposure tends to do
          well in exactly the macro states - risk-off, falling real rates, geo-
          political stress - where the energy and financial cyclicals doing the
          heavy lifting elsewhere in the book do badly.
        </p>
        <p>
          So this is ballast, sized small on purpose. I am not underwriting a gold
          bull thesis; I am buying a position whose payoff is shaped to offset the
          rest of the portfolio, and I accept that in a calm, cyclical-up tape it
          will quietly lag. The premium royalty multiple is real and I treat it as
          the cost of that insurance rather than as a mis-pricing to exploit - a
          capital-light model with a diversified book of streams genuinely
          deserves to trade above the miners, and I am paying for diversification,
          not for cheapness.
        </p>
      </>
    ),
    keyVariables: [
      {
        label: "Gold price",
        detail:
          "The macro driver - and the whole reason the position is owned. The point isn't that gold goes up; it's that gold tends to rise when the cyclical book is under pressure, which is the diversification I'm paying for.",
      },
      {
        label: "Royalty / stream portfolio quality",
        detail:
          "Diversification and counterparty risk across the underlying mines. A single impaired or halted counterparty mine matters more for a streamer than the gold price on any given day - breadth is what keeps this defensive rather than fragile.",
      },
      {
        label: "Multiple vs. the miners",
        detail:
          "The premium the capital-light model commands, and the cost of the hedge. If that premium compresses without offsetting growth, I'm paying more for the insurance than it's worth.",
      },
    ],
    valuation: (
      <>
        Framed through{" "}
        <span className="note-tool">Comparable Company Analysis</span> against
        royalty and streaming peers rather than against the operating miners - the
        relevant comparison is to other capital-light businesses with the same
        risk profile. The question the comp screen poses is narrow and honest: is
        the premium-to-miners multiple in line with the streaming peer group, or
        am I overpaying for the ballast? For a deliberately small hedge, that is
        the only valuation question worth asking.
      </>
    ),
  },
  {
    slug: "bce",
    ticker: "BCE.TO",
    name: "BCE Inc.",
    frameworkSlug: "credit-spreads",
    frameworkLabel: "Credit Spread Decomposition",
    thesis: (
      <>
        <p>
          This is the honest problem child of the book, and it stays in the note
          as a loser rather than getting quietly rewritten into a winner. The
          original view was a contrarian yield call: a levered, rate-sensitive
          telecom incumbent, bought for a high distribution, that looked oversold
          into the rate cycle on the assumption that wireless and wireline
          competition would rationalise and that the payout was more durable than
          the sell-off implied. The position is down since entry, and the price is
          telling me the market is more worried about the balance sheet and the
          dividend than I was when I put it on.
        </p>
        <p>
          The thesis hasn't been confirmed wrong yet, but it is on the back foot,
          and the right posture for a contrarian call that isn't working is not to
          double down. So this is held small and on a short leash. I am not
          averaging down to manufacture conviction I no longer fully have; I am
          watching the kill criteria - deteriorating free-cash-flow dividend
          coverage, leverage that rises instead of falls, competition that
          intensifies rather than rationalises - and I am prepared to be stopped
          out. The real thing this position tests is governance: whether I respect
          a sell rule I wrote in advance when the market disagrees with me, or
          whether I let a small loss talk me into a large one. That discipline is
          worth more to the book than being right on any single name.
        </p>
      </>
    ),
    keyVariables: [
      {
        label: "Dividend coverage (FCF payout)",
        detail:
          "The leg the entire thesis hangs on - and the one under the most pressure. If free cash flow doesn't comfortably cover the distribution, the yield that justified the position is a liability, not a cushion.",
      },
      {
        label: "Net debt / EBITDA",
        detail:
          "Leverage in a higher-rate world - the market's actual worry. Rising leverage as rates stay high is the scenario that turns a yield play into a balance-sheet problem, and it's the variable I'd act on fastest.",
      },
      {
        label: "Wireless / wireline pricing",
        detail:
          "The original bet, still unresolved. The contrarian case was that competitive intensity would ease; if pricing keeps deteriorating instead, the operating thesis is broken regardless of what rates do.",
      },
    ],
    valuation: (
      <>
        Framed through{" "}
        <span className="note-tool">Credit Spread Decomposition</span> rather than
        an equity model, on purpose. For a levered incumbent where the worry is
        solvency and the durability of the payout, what the bond market charges to
        lend to the company is a cleaner, less hopeful read on the risk than the
        equity's dividend yield - a widening spread is the credit market pricing
        the same fear the falling share price reflects, but with more discipline.
        Right now it is the part of the thesis flashing, which is exactly why I'm
        watching the credit, not the yield.
      </>
    ),
  },
];

export function getNote(slug: string): ResearchNote | undefined {
  return NOTES.find((n) => n.slug === slug);
}
