import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
  ReferenceLine,
} from "recharts";
import {
  COMPANIES,
  DEFAULT_STATE,
  HORIZON,
  LENSES,
  State,
  closestLens,
  edgarLink,
  footballField,
  getCompany,
  getLens,
  value,
} from "../lib/dcf";
import { signClass } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import CopyLinkButton from "../components/CopyLinkButton";
import DataSource from "../components/DataSource";

// $m with thousands separators; whole and 2-dp dollars per share.
const m = (n: number) => Math.round(n).toLocaleString("en-US");
const usd0 = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const usd2 = (n: number) => `$${n.toFixed(2)}`;
const wpct = (d: number) => `${(d * 100).toFixed(1)}%`;
const sgnpct = (f: number) =>
  `${f > 0 ? "+" : f < 0 ? "−" : ""}${Math.abs(f * 100).toFixed(0)}%`;

interface TipProps {
  active?: boolean;
  payload?: { payload: { short: string; price: number } }[];
}
function FieldTooltip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: 12,
        background: "var(--paper)",
        border: "1px solid #d2ccbe",
        borderRadius: 2,
        padding: "5px 9px",
      }}
    >
      <span style={{ color: "var(--ink)" }}>{d.short}: </span>
      <span style={{ color: "var(--ink-3)" }}>{usd2(d.price)}</span>
    </div>
  );
}

export default function DcfSensitivity() {
  const [state, setState] = useSharedState<State>(DEFAULT_STATE);
  const company = getCompany(state.company);
  const lens = getLens(state.lens);

  const val = useMemo(() => value(company, lens.wacc, lens.g), [company, lens]);
  const field = useMemo(
    () => footballField(company, lens.id),
    [company, lens.id],
  );

  const prices = field.map((b) => b.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const hasPrice = company.price != null;
  const market = company.price ?? 0;
  const vsMarket = hasPrice ? val.perShare / market - 1 : 0;
  const closest = closestLens(company);
  const axisMax = Math.max(maxP, market) * 1.14;
  const link = edgarLink(company);

  // The word for the gap between this lens's value and the market price.
  const gapWord =
    Math.abs(vsMarket) < 0.03
      ? "in line with"
      : vsMarket < 0
        ? `a ${sgnpct(Math.abs(vsMarket))} discount to`
        : `a ${sgnpct(vsMarket)} premium to`;

  const chartData = field.map((b) => ({
    short: b.short,
    price: b.price,
    active: b.active,
  }));

  return (
    <ToolPage
      slug="dcf-sensitivity"
      actions={<CopyLinkButton />}
      lede={
        <>
          A ten-year discounted-cash-flow model on real companies, with the cash
          flow, debt, and share count pulled from their latest 10-K. Pick a
          company and a valuation <em>lens</em>, and watch fair value - and the
          whole football field - swing on the discount rate and terminal growth,
          then land it against the price the market actually paid.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Company</span>
          {COMPANIES.map((c) => (
            <button
              key={c.id}
              className={`preset${state.company === c.id ? " active" : ""}`}
              title={c.synthetic ? "A clean illustrative baseline" : c.name}
              onClick={() => setState({ ...state, company: c.id })}
            >
              {c.short}
            </button>
          ))}
        </div>
        <div className="scenario-row">
          <span className="toolbar-label">Valuation lens</span>
          {LENSES.map((l) => (
            <button
              key={l.id}
              className={`preset${state.lens === l.id ? " active" : ""}`}
              title={l.blurb}
              onClick={() => setState({ ...state, lens: l.id })}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Implied value - {lens.short}</div>
          <div className="v">{usd2(val.perShare)}</div>
        </div>
        {hasPrice ? (
          <>
            <div className="stat">
              <div className="k">Market - {company.asOf}</div>
              <div className="v">{usd2(market)}</div>
            </div>
            <div className="stat">
              <div className="k">Implied vs market</div>
              <div className={`v ${signClass(vsMarket)}`}>{sgnpct(vsMarket)}</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat">
              <div className="k">Value past the forecast</div>
              <div className="v">{(val.tvShare * 100).toFixed(0)}%</div>
            </div>
            <div className="stat">
              <div className="k">Range across lenses</div>
              <div className="v">
                {usd0(minP)}–{usd0(maxP)}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="verdict">
        {hasPrice ? (
          <>
            A ten-year DCF of <strong>{company.name}</strong>, discounted through
            the <strong>{lens.label.toLowerCase()}</strong> lens (
            {wpct(lens.wacc)} WACC, {wpct(lens.g)} terminal growth), is worth{" "}
            <strong>{usd2(val.perShare)}</strong> a share -{" "}
            <strong className={signClass(vsMarket)}>{gapWord}</strong> the{" "}
            {usd2(market)} the market paid on {company.asOf}.{" "}
            <strong>{(val.tvShare * 100).toFixed(0)}%</strong> of that value sits
            in the terminal figure past year {HORIZON}
            {closest && (
              <>
                , and the market is pricing something close to the{" "}
                <strong>{closest.label.toLowerCase()}</strong> lens
              </>
            )}
            .
          </>
        ) : (
          <>
            The <strong>{lens.label.toLowerCase()}</strong> lens values the
            illustrative company at <strong>{usd2(val.perShare)}</strong> a
            share, with <strong>{(val.tvShare * 100).toFixed(0)}%</strong> of
            that resting on the terminal value past year {HORIZON}. Swap lenses
            and fair value swings from <strong>{usd0(minP)}</strong> to{" "}
            <strong>{usd0(maxP)}</strong> on the discount rate and terminal
            growth alone.
          </>
        )}
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>Implied value per share, by lens</h4>
        <div className="chart-wrap" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 8, right: 48, left: 16, bottom: 4 }}
            >
              <XAxis
                type="number"
                domain={[0, axisMax]}
                tick={{ fontSize: 11, fill: "#80848a" }}
                axisLine={{ stroke: "#d2ccbe" }}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                type="category"
                dataKey="short"
                tick={{ fontSize: 11, fill: "#4a4d51" }}
                axisLine={false}
                tickLine={false}
                width={78}
              />
              <Tooltip cursor={{ fill: "rgba(31,74,92,0.05)" }} content={<FieldTooltip />} />
              {hasPrice && (
                <ReferenceLine
                  x={market}
                  stroke="#b08433"
                  strokeWidth={1.5}
                  label={{
                    value: `market ${usd0(market)}`,
                    position: "top",
                    fontSize: 10,
                    fill: "#b08433",
                  }}
                />
              )}
              <Bar dataKey="price" radius={1}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.active ? "#1f4a5c" : "#c4bdac"} />
                ))}
                <LabelList
                  dataKey="price"
                  position="right"
                  formatter={(v: number) => usd0(v)}
                  style={{ fontFamily: "var(--mono)", fontSize: 11, fill: "#4a4d51" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {hasPrice && (
          <div className="note">
            The gold line is {company.name}'s closing price on the 10-K filing
            date. Where it falls among the bars is the assumption set the market
            is implicitly making.
          </div>
        )}

        <table className="data" style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>Source of value</th>
              <th className="num">Cash flow ($m)</th>
              <th className="num">Discount factor</th>
              <th className="num">Present value ($m)</th>
            </tr>
          </thead>
          <tbody>
            {val.years.map((y) => (
              <tr key={y.year}>
                <td>Year {y.year} FCF</td>
                <td className="num">{m(y.fcf)}</td>
                <td className="num">{y.discountFactor.toFixed(3)}</td>
                <td className="num">{m(y.pv)}</td>
              </tr>
            ))}
            <tr className="is-leader">
              <td>
                <strong>Terminal value</strong>
              </td>
              <td className="num">{m(val.tvUndiscounted)}</td>
              <td className="num">{val.tvDiscountFactor.toFixed(3)}</td>
              <td className="num">{m(val.tvPV)}</td>
            </tr>
          </tbody>
          <tbody>
            <tr className="total">
              <td>Enterprise value</td>
              <td className="num"></td>
              <td className="num"></td>
              <td className="num">{m(val.ev)}</td>
            </tr>
            <tr>
              <td>less: Net debt</td>
              <td className="num"></td>
              <td className="num"></td>
              <td className="num">
                {val.netDebt < 0 ? `+${m(-val.netDebt)}` : `−${m(val.netDebt)}`}
              </td>
            </tr>
            <tr className="total">
              <td>Equity value</td>
              <td className="num"></td>
              <td className="num"></td>
              <td className="num">{m(val.equity)}</td>
            </tr>
          </tbody>
        </table>
        <div className="note">
          ÷ {m(company.shares)}m shares = <strong>{usd2(val.perShare)}</strong> a
          share.{" "}
          {company.synthetic ? (
            "Illustrative figures - not a real company."
          ) : (
            <>
              Source: {company.name} {company.fy} Form 10-K via{" "}
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  SEC EDGAR
                </a>
              ) : (
                "SEC EDGAR"
              )}
              . Free cash flow is a 3-year average of operating cash flow minus
              capex; net debt is total debt less cash and marketable securities;
              price is the close on {company.asOf}. Near-term FCF growth of{" "}
              {wpct(company.nearGrowth)} is an assumption, not a reported figure.
            </>
          )}
        </div>
      </div>

      <DataSource
        kind={company.synthetic ? "illustrative" : "sourced"}
        provenance={
          company.synthetic ? (
            <>
              Illustrative figures - not a real company. Net debt and share count
              are fixed, so every move in fair value traces to the discount rate
              and terminal growth alone.
            </>
          ) : (
            <>
              The hard anchors below are {company.name}'s {company.fy} Form 10-K
              figures; near-term FCF growth is the one input that's assumed, and
              WACC and terminal growth are the lens you choose.
            </>
          )
        }
        source={
          link ? { label: `${company.name} 10-K on SEC EDGAR`, href: link } : undefined
        }
      >
        <table className="data">
          <thead>
            <tr>
              <th>Input</th>
              <th className="num">Value</th>
              <th>Where it comes from</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Year-1 free cash flow</td>
              <td className="num">{m(company.fcf1)} $m</td>
              <td>
                {company.synthetic
                  ? "Assumed"
                  : "3-year average of operating cash flow − capex"}
              </td>
            </tr>
            <tr className="is-leader">
              <td>Near-term FCF growth</td>
              <td className="num">{wpct(company.nearGrowth)}</td>
              <td>Assumption - the one explicitly chosen input</td>
            </tr>
            <tr>
              <td>Net debt</td>
              <td className="num">{m(company.netDebt)} $m</td>
              <td>
                {company.synthetic
                  ? "Assumed, held fixed"
                  : "Total debt − cash & marketable securities"}
              </td>
            </tr>
            <tr>
              <td>Diluted shares</td>
              <td className="num">{m(company.shares)} m</td>
              <td>{company.synthetic ? "Assumed, held fixed" : "Latest reported"}</td>
            </tr>
            {hasPrice && (
              <tr>
                <td>Market price</td>
                <td className="num">{usd2(market)}</td>
                <td>Close on the 10-K filing date ({company.asOf})</td>
              </tr>
            )}
          </tbody>
        </table>
      </DataSource>

      <div className="prose">
        <h3>How it's calculated</h3>
        <p>
          A standard two-stage DCF. Free cash flow is forecast explicitly for{" "}
          {HORIZON} years, growing at the company's assumed near-term rate;
          everything beyond the horizon is captured by a Gordon-growth terminal
          value. Each piece is discounted to today at the weighted average cost
          of capital:
        </p>
        <div className="formula">
          EV = Σ FCF<sub>t</sub> / (1 + WACC)<sup>t</sup> &nbsp; + &nbsp; TV /
          (1 + WACC)<sup>N</sup>
          <br />
          TV = FCF<sub>N</sub> × (1 + g) / (WACC − g)
        </div>
        <p>
          Subtract net debt from enterprise value to get equity value, divide by
          shares, and you have an implied price. Only WACC and terminal growth
          change between lenses - the cash flows, debt, and share count are fixed
          and sourced from the filing.
        </p>

        <h3>Why the valuation is mostly the discount rate</h3>
        <p>
          More than half of enterprise value typically lives in the
          terminal-value row - the part with the least analysis behind it, a
          single fraction (WACC − g) in the denominator. Because that gap is
          small, a half-point move in either input moves the quotient by a large
          percentage, which is why the football-field bars are as wide as they
          are. The gold line shows the rest of the story: for a richly valued
          name the market can sit beyond even the bull lens, while a steadier
          business lands inside the range.
        </p>
        <div className="callout">
          <strong>The honest read:</strong> a DCF doesn't tell you what a company
          is worth so much as what you'd have to believe for it to be worth its
          price. Read the football field that way - the spread and the
          assumptions behind each end, not a single number to the penny. This is
          an educational tool on public data, not investment advice or a price
          target.
        </div>
        <p>
          The relative-value alternative is{" "}
          <Link to="/comparable-companies">Comparable Company Analysis</Link> —
          where the same financials imply a different price depending entirely on
          who you call a peer.
        </p>
      </div>
    </ToolPage>
  );
}
