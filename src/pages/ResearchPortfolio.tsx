import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import bookData from "../data/portfolio.json";
import {
  Book,
  PositionDerived,
  derivePositions,
  riskLens,
  allocationBySector,
  attributionSectors,
  contributionRows,
  bookEquity,
  bookReturn,
  currentCashWeight,
  CONVICTION_PIPS,
  CONVICTION_LABEL,
  SECTOR_SHORT,
} from "../lib/portfolio";
import { attribute } from "../lib/attribution";
import { signed, signClass } from "../lib/format";
import EffectChart from "../components/EffectChart";

const book = bookData as unknown as Book;

// ── formatting ──────────────────────────────────────────────────────────────
const usd0 = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const usd2 = (n: number) => `$${n.toFixed(2)}`;
// unsigned / signed percent of a fraction
const fp = (f: number, d = 1) => `${(f * 100).toFixed(d)}%`;
const fsign = (f: number, d = 1) => `${signed(f * 100, d)}%`;
const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const fmtMonth = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short" });

export default function ResearchPortfolio() {
  useEffect(() => {
    document.title = "Research Portfolio · Markets Lab";
    return () => {
      document.title = "Markets Lab";
    };
  }, []);

  const positions = useMemo(() => derivePositions(book), []);
  const equity = bookEquity(book);
  const ret = bookReturn(book);
  const risk = useMemo(() => riskLens(book), []);
  const alloc = useMemo(() => allocationBySector(book), []);
  const contrib = useMemo(() => contributionRows(book), []);

  // Brinson-Fachler on my own decisions - the exact Sector[] handed to the
  // Attribution Playground, so the cockpit and the deep-linked playground show
  // the identical decomposition.
  const attrSectors = useMemo(() => attributionSectors(book), []);
  const attr = useMemo(() => attribute(attrSectors), [attrSectors]);
  const attrLink = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("s", encodeURIComponent(JSON.stringify(attrSectors)));
    return `/attribution?${sp.toString()}`;
  }, [attrSectors]);

  const bench = book.benchmark;
  const cardOrder = [...positions].sort(
    (a, b) => b.currentWeight - a.currentWeight,
  );

  return (
    <div className="wrap tool-page rp">
      <div className="tool-page-top">
        <Link to="/" className="back">
          ← All tools
        </Link>
        <span className="rp-badge">model · illustrative</span>
      </div>

      <h1>Research Portfolio</h1>
      <p className="lede">
        A <strong>model</strong> book - synthetic capital, real prices. Every
        name has a thesis, a conviction-based size, and a sell rule. Read the
        process, not the P&amp;L. Public data only.
      </p>

      {/* headline strip */}
      <div className="rp-strip">
        <div className="rp-strip-item">
          <div className="k">Notional book</div>
          <div className="v num">{usd0(book.notionalCapital)}</div>
        </div>
        <div className="rp-strip-item">
          <div className="k">Marked equity</div>
          <div className="v num">{usd0(equity)}</div>
        </div>
        <div className="rp-strip-item">
          <div className="k">Book return (model)</div>
          <div className={`v num ${signClass(ret)}`}>{fsign(ret)}</div>
        </div>
        <div className="rp-strip-item">
          <div className="k">Benchmark - {bench.name}</div>
          <div className={`v num ${signClass(bench.windowReturn)}`}>
            {signed(bench.windowReturn)}%
          </div>
        </div>
        <div className="rp-strip-item">
          <div className="k">Positions</div>
          <div className="v num">
            {positions.length} <span className="rp-dim">+ cash</span>
          </div>
        </div>
        <div className="rp-strip-item">
          <div className="k">As of</div>
          <div className="v num">{fmtDate(book.asOf)}</div>
        </div>
      </div>
      <p className="rp-since">
        Inception {fmtDate(book.inception)} · re-marked {book.remarkCadence} on
        real closes · cash held flat
      </p>

      {/* row 1 - equity curve + contribution */}
      <div className="rp-grid">
        <section className="rp-panel">
          <h4>
            Equity curve <span className="rp-illus">model · illustrative</span>
          </h4>
          <div className="chart-wrap" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={book.equityCurve}
                margin={{ top: 6, right: 12, left: 6, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1f4a5c" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#1f4a5c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#80848a" }}
                  axisLine={{ stroke: "#d2ccbe" }}
                  tickLine={false}
                  tickFormatter={fmtMonth}
                  minTickGap={24}
                />
                <YAxis
                  domain={["dataMin - 8000", "dataMax + 8000"]}
                  tick={{ fontSize: 11, fill: "#80848a" }}
                  axisLine={false}
                  tickLine={false}
                  width={62}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => usd0(v)}
                  labelFormatter={(l) => fmtDate(String(l))}
                  contentStyle={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    border: "1px solid #d2ccbe",
                    borderRadius: 2,
                  }}
                />
                <ReferenceLine
                  y={book.notionalCapital}
                  stroke="#b08433"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1f4a5c"
                  strokeWidth={1.6}
                  fill="url(#rpFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="note">
            Gold dashes mark the $
            {(book.notionalCapital / 1000).toFixed(0)}k starting line.
          </div>
        </section>

        <section className="rp-panel">
          <h4>Contribution to return - since entry</h4>
          <p className="rp-panel-sub">
            Each name's P&amp;L as a share of the book. Bars sum to {fsign(ret)}.
          </p>
          <div
            className="chart-wrap"
            style={{ height: Math.max(220, contrib.length * 30) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={contrib.map((r) => ({
                  name: r.label,
                  v: r.contribution * 100,
                  cash: r.isCash,
                }))}
                margin={{ top: 4, right: 40, left: 6, bottom: 0 }}
                barCategoryGap={5}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#80848a" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(1)}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#4a4d51", fontFamily: "var(--mono)" }}
                  axisLine={{ stroke: "#d2ccbe" }}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  formatter={(v: number) => `${signed(v, 2)}%`}
                  contentStyle={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    border: "1px solid #d2ccbe",
                    borderRadius: 2,
                  }}
                />
                <ReferenceLine x={0} stroke="#80848a" />
                <Bar dataKey="v" radius={1}>
                  {contrib.map((r, i) => (
                    <Cell
                      key={i}
                      fill={
                        r.isCash
                          ? "#c4bdac"
                          : r.contribution >= 0
                            ? "#2f6b4f"
                            : "#9b3a36"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* row 2 - allocation + risk lens */}
      <div className="rp-grid">
        <section className="rp-panel">
          <h4>Allocation vs. benchmark - GICS</h4>
          <p className="rp-panel-sub">
            Book vs. {bench.name} sector weights. Active tilt at right.
          </p>
          <div className="rp-alloc">
            {alloc
              .filter((a) => a.portfolioWeight > 0 || a.benchmarkWeight > 0)
              .map((a) => {
                // Track spans 0 → MAXW weight (covers TSX Financials ~32%).
                const MAXW = 0.35;
                const barPct = Math.min(100, (a.portfolioWeight / MAXW) * 100);
                const benchPct = Math.min(100, (a.benchmarkWeight / MAXW) * 100);
                return (
                  <div className="rp-alloc-row" key={a.sector}>
                    <div className="rp-alloc-name">
                      {SECTOR_SHORT[a.sector]}
                    </div>
                    <div className="rp-alloc-track">
                      <div
                        className="rp-alloc-bar"
                        style={{ width: `${barPct}%` }}
                      />
                      <div
                        className="rp-alloc-bench"
                        style={{ left: `${benchPct}%` }}
                        title={`Benchmark ${fp(a.benchmarkWeight)}`}
                      />
                    </div>
                    <div className="rp-alloc-w num">
                      {fp(a.portfolioWeight)}
                    </div>
                    <div className={`rp-alloc-active num ${signClass(a.active)}`}>
                      {fsign(a.active, 0)}
                    </div>
                  </div>
                );
              })}
            <div className="rp-alloc-row rp-alloc-cash">
              <div className="rp-alloc-name">Cash</div>
              <div className="rp-alloc-track">
                <div
                  className="rp-alloc-bar is-cash"
                  style={{
                    width: `${Math.min(100, (currentCashWeight(book) / 0.35) * 100)}%`,
                  }}
                />
              </div>
              <div className="rp-alloc-w num">{fp(currentCashWeight(book))}</div>
              <div className="rp-alloc-active num rp-dim">—</div>
            </div>
          </div>
          <div className="note">Gold tick = benchmark weight.</div>
        </section>

        <section className="rp-panel">
          <h4>Risk lens</h4>
          <dl className="rp-risk">
            <div>
              <dt>Top-5 concentration</dt>
              <dd className="num">{fp(risk.top5Concentration)}</dd>
            </div>
            <div>
              <dt>Equity beta (est.)</dt>
              <dd className="num">{risk.equityBeta.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Cash buffer</dt>
              <dd className="num">{fp(risk.cashBuffer)}</dd>
            </div>
            <div>
              <dt>Largest single name</dt>
              <dd className="num">
                {fp(risk.largestName.weight)}{" "}
                <span className="rp-dim">{risk.largestName.ticker}</span>
              </dd>
            </div>
            <div>
              <dt># names</dt>
              <dd className="num">{risk.numNames}</dd>
            </div>
          </dl>
          <div className="note">
            Beta is an illustrative weight-weighted estimate; cash is zero-beta.
          </div>
        </section>
      </div>

      {/* row 3 - attribution */}
      <section className="rp-panel rp-attr">
        <div className="rp-attr-head">
          <div>
            <h4>Attribution - my decisions vs. benchmark</h4>
            <p className="rp-panel-sub">
              Same engine as the{" "}
              <Link to="/attribution">Attribution Playground</Link>. Allocation
              is the bet on <em>where</em> to be; selection on <em>what</em> to
              hold.
            </p>
          </div>
          <Link to={attrLink} className="preset rp-attr-link">
            Open in Attribution Playground →
          </Link>
        </div>

        <div className="rp-attr-body">
          <div className="rp-attr-effects">
            <div className="rp-effect">
              <span>Allocation</span>
              <strong className={signClass(attr.totals.allocation)}>
                {signed(attr.totals.allocation, 2)}%
              </strong>
            </div>
            <div className="rp-effect">
              <span>Selection</span>
              <strong className={signClass(attr.totals.selection)}>
                {signed(attr.totals.selection, 2)}%
              </strong>
            </div>
            <div className="rp-effect">
              <span>Interaction</span>
              <strong className={signClass(attr.totals.interaction)}>
                {signed(attr.totals.interaction, 2)}%
              </strong>
            </div>
            <div className="rp-effect rp-effect-total">
              <span>Total active</span>
              <strong className={signClass(attr.active)}>
                {signed(attr.active, 2)}%
              </strong>
            </div>
          </div>
          <div className="rp-attr-chart">
            <EffectChart result={attr} foldInteraction={false} />
          </div>
        </div>
        <div className="note">
          Single-period; effects sum to total active exactly. Cards below show
          each name's staggered since-entry P&amp;L.
        </div>
      </section>

      {/* positions */}
      <div className="rp-pos-head">
        <h3>Positions</h3>
        <span className="hr" />
        <span className="rp-dim num">{positions.length} names</span>
      </div>
      <div className="rp-pos-grid">
        {cardOrder.map((p) => (
          <PositionCard key={p.ticker} p={p} />
        ))}
      </div>

      {/* methodology */}
      <div className="prose rp-method">
        <h3>How it's built</h3>
        <p>
          Only the capital is invented - a $
          {(book.notionalCapital / 1000000).toFixed(1)}M paper book. Entry
          prices and marks are real closes; the equity curve is genuine
          mark-to-market, dated and never backfilled. Conviction drives size;
          the {bench.name} anchors the allocation and attribution views.
        </p>
        <div className="callout">
          A model book that's up impresses no one - I picked the entries. The
          signal is the discipline: a thesis, a size that tracks conviction, a
          sell rule set before the trade, and attribution that owns the losers.
          Illustrative; public data only.
        </div>
      </div>
    </div>
  );
}

function PositionCard({ p }: { p: PositionDerived }) {
  const pips = CONVICTION_PIPS[p.conviction];
  return (
    <div className="rp-card">
      <div className="rp-card-top">
        <div>
          <span className="rp-card-ticker num">{p.ticker}</span>
          <span className="rp-card-name">{p.name}</span>
        </div>
        <span className="rp-card-sector">{SECTOR_SHORT[p.sector]}</span>
      </div>
      <div className="rp-card-entered num">entered {fmtDate(p.entryDate)}</div>

      <p className="rp-card-thesis">"{p.thesisOneLiner}"</p>

      <div className="rp-card-meta">
        <div className="rp-conviction">
          <span className="rp-conviction-meter" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`rp-pip${i < pips ? " on" : ""} ${p.conviction}`}
              />
            ))}
          </span>
          <span className="rp-conviction-label">
            {CONVICTION_LABEL[p.conviction]} conviction
          </span>
        </div>
        <div className="rp-weight">
          <span className="rp-weight-v num">{fp(p.currentWeight)}</span>
          <span className="rp-weight-k">weight</span>
        </div>
      </div>

      <div className="rp-card-px num">
        <span>Entry {usd2(p.entryPrice)}</span>
        <span>Mark {usd2(p.currentPrice)}</span>
        <span className={signClass(p.returnSinceEntry)}>
          {fsign(p.returnSinceEntry)}
        </span>
      </div>

      <div className="rp-kill">
        <div className="rp-kill-head">What would change my mind</div>
        <ul>
          {p.killCriteria.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
      </div>

      <div className="rp-card-foot">
        <Link to={`/${p.frameworkSlug}`} className="rp-foot-link">
          Framework ▸
        </Link>
        <Link to={`/research-portfolio/note/${p.noteSlug}`} className="rp-foot-link">
          Note ▸ read
        </Link>
      </div>
    </div>
  );
}
