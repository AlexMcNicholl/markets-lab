import { useMemo } from "react";
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
  COMPANY,
  DEFAULT_SCENARIO,
  footballField,
  getScenario,
  SCENARIOS,
  value,
} from "../lib/dcf";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import CopyLinkButton from "../components/CopyLinkButton";

// $m with thousands separators; whole dollars per share.
const m = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const usd0 = (n: number) => `$${n.toFixed(0)}`;
const usd2 = (n: number) => `$${n.toFixed(2)}`;
const wpct = (d: number) => `${(d * 100).toFixed(1)}%`;

interface TipProps {
  active?: boolean;
  payload?: { payload: { short: string; lo: number; band: number; central: number } }[];
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
        padding: "6px 9px",
        lineHeight: 1.5,
      }}
    >
      <div style={{ color: "var(--ink)" }}>{d.short}</div>
      <div style={{ color: "var(--ink-3)" }}>
        {usd0(d.lo)} – {usd0(d.lo + d.band)} range
      </div>
      <div style={{ color: "var(--ink-3)" }}>central {usd0(d.central)}</div>
    </div>
  );
}

export default function DcfSensitivity() {
  const [scenarioId, setScenarioId] = useSharedState<string>(DEFAULT_SCENARIO);
  const scenario = getScenario(scenarioId);

  const val = useMemo(() => value(scenario.wacc, scenario.g), [scenario]);
  const field = useMemo(() => footballField(scenarioId), [scenarioId]);

  const centrals = field.map((b) => b.central);
  const minP = Math.min(...centrals);
  const maxP = Math.max(...centrals);
  const maxHi = Math.max(...field.map((b) => b.hi));
  const axisMax = Math.ceil((maxHi + 6) / 10) * 10;

  // The scenario whose fair value sits furthest from the active one — the
  // honest "and yet" the verdict points at.
  const activeBar = field.find((b) => b.active) ?? field[0];
  const farthest = field.reduce((a, b) =>
    Math.abs(b.central - activeBar.central) > Math.abs(a.central - activeBar.central)
      ? b
      : a,
  );
  const farScenario = getScenario(farthest.id);

  const baseCentral = field.find((b) => b.id === "base")?.central ?? val.perShare;

  const chartData = field.map((b) => ({
    short: b.short,
    lo: b.lo,
    band: b.hi - b.lo,
    central: b.central,
    active: b.active,
  }));

  return (
    <ToolPage
      slug="dcf-sensitivity"
      actions={<CopyLinkButton />}
      lede={
        <>
          One company, one set of cash flows — valued through four different
          views of the discount rate and terminal growth. Pick a lens below and
          watch the implied share price, and the whole <em>football field</em>,
          swing on two assumptions you can barely justify to a decimal.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Valuation lens</span>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`preset${scenarioId === s.id ? " active" : ""}`}
              title={s.blurb}
              onClick={() => setScenarioId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Implied price — {scenario.short}</div>
          <div className="v">{usd2(val.perShare)}</div>
        </div>
        <div className="stat">
          <div className="k">Value past the forecast</div>
          <div className="v">{(val.tvShare * 100).toFixed(0)}%</div>
        </div>
        <div className="stat">
          <div className="k">Fair value across lenses</div>
          <div className="v">
            {usd0(minP)}–{usd0(maxP)}
          </div>
        </div>
      </div>

      <div className="verdict">
        The <strong>{scenario.label.toLowerCase()}</strong> lens — a{" "}
        {wpct(scenario.wacc)} discount rate against {wpct(scenario.g)} terminal
        growth — values the same cash flows at{" "}
        <strong>{usd2(val.perShare)}</strong> a share.{" "}
        <strong>{(val.tvShare * 100).toFixed(0)}%</strong> of that rests on the
        terminal value, a single figure past year {COMPANY.horizon}. Swing to the{" "}
        <strong>{farScenario.label.toLowerCase()}</strong> view and fair value
        moves to <strong>{usd2(farthest.central)}</strong> — same business.
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>Implied value per share, by lens</h4>
        <div className="chart-wrap" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 8, right: 44, left: 8, bottom: 4 }}
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
                width={72}
              />
              <Tooltip cursor={{ fill: "rgba(31,74,92,0.05)" }} content={<FieldTooltip />} />
              <ReferenceLine
                x={baseCentral}
                stroke="#b9b2a3"
                strokeDasharray="4 3"
                label={{
                  value: "base",
                  position: "top",
                  fontSize: 10,
                  fill: "#80848a",
                }}
              />
              <Bar dataKey="lo" stackId="a" fill="transparent" />
              <Bar dataKey="band" stackId="a" radius={1}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.active ? "#1f4a5c" : "#c4bdac"} />
                ))}
                <LabelList
                  dataKey="central"
                  position="right"
                  formatter={(v: number) => usd0(v)}
                  style={{ fontFamily: "var(--mono)", fontSize: 11, fill: "#4a4d51" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="note">
          Each bar spans the price when that lens's assumptions flex by ±50bp on
          the discount rate and ±25bp on terminal growth; the label marks the
          central estimate. The dashed line is the base case.
        </div>

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
              <td className="num">−{m(val.netDebt)}</td>
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
          ÷ {m(COMPANY.shares)}m shares ={" "}
          <strong>{usd2(val.perShare)}</strong> a share.
        </div>
      </div>

      <div className="prose">
        <h3>How it's calculated</h3>
        <p>
          A standard two-stage DCF. Free cash flow is forecast explicitly for{" "}
          {COMPANY.horizon} years, growing at {wpct(COMPANY.nearTermGrowth)} a
          year; everything beyond the horizon is captured by a Gordon-growth
          terminal value. Each piece is discounted to today at the weighted
          average cost of capital:
        </p>
        <div className="formula">
          EV = Σ FCF<sub>t</sub> / (1 + WACC)<sup>t</sup> &nbsp; + &nbsp; TV /
          (1 + WACC)<sup>N</sup>
          <br />
          TV = FCF<sub>N</sub> × (1 + g) / (WACC − g)
        </div>
        <p>
          Subtract net debt from enterprise value to get equity value, divide by
          shares, and you have an implied price. The cash flows, debt, and share
          count never change between lenses — only WACC and g do.
        </p>

        <h3>Why the valuation is mostly the discount rate</h3>
        <p>
          Notice how much of enterprise value lives in the terminal-value row:
          the explicit five-year forecast — the part with actual analysis behind
          it — is the minority of the answer. The rest is a single fraction,{" "}
          (WACC − g), in the denominator. Because that gap is small, a 50bp move
          in either input moves the quotient by a large percentage, which is why
          the football-field bars are as wide as they are.
        </p>
        <div className="callout">
          <strong>The honest read:</strong> a DCF doesn't tell you what a company
          is worth so much as what you'd have to believe for it to be worth a
          given price. The football field is the candid version of the model —
          present the range and the assumptions behind each end, not a single
          false-precision number to the penny.
        </div>
      </div>
    </ToolPage>
  );
}
