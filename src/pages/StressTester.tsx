import { useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { STRESS_SCENARIOS, PORTFOLIOS, runStress } from "../lib/stress";
import { signed, signClass } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import CopyLinkButton from "../components/CopyLinkButton";

interface ToolState {
  sc: string;
  pf: string;
}

const DEFAULT_STATE: ToolState = { sc: "gfc-2008", pf: "sixty-forty" };

export default function StressTester() {
  const [state, setState] = useSharedState<ToolState>(DEFAULT_STATE);

  const scenario =
    STRESS_SCENARIOS.find((s) => s.id === state.sc) ?? STRESS_SCENARIOS[0];
  const portfolio =
    PORTFOLIOS.find((p) => p.id === state.pf) ?? PORTFOLIOS[0];

  const result = useMemo(
    () => runStress(scenario, portfolio),
    [scenario, portfolio],
  );

  const chartData = result.assets
    .filter((a) => a.weight > 0)
    .map((a) => ({ name: a.short, value: a.contribution }));

  const bestIsPositive = result.bestAsset.contribution > 0;
  const verb = result.total < 0 ? "fell" : "gained";

  return (
    <ToolPage
      slug="stress-tester"
      actions={<CopyLinkButton />}
      lede={
        <>
          Apply a named historical shock to a multi-asset portfolio and read off
          how much each position contributed to the total drawdown — or cushioned
          it. Pick a scenario and a portfolio type below.
        </>
      }
    >
      <div
        className="toolbar"
        style={{ flexDirection: "column", alignItems: "flex-start" }}
      >
        <div className="scenario-row">
          <span className="toolbar-label">Scenario</span>
          {STRESS_SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`preset${state.sc === s.id ? " active" : ""}`}
              title={s.blurb}
              onClick={() => setState({ ...state, sc: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="scenario-row">
          <span className="toolbar-label">Portfolio</span>
          {PORTFOLIOS.map((p) => (
            <button
              key={p.id}
              className={`preset${state.pf === p.id ? " active" : ""}`}
              title={p.blurb}
              onClick={() => setState({ ...state, pf: p.id })}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Total Impact</div>
          <div className={`v ${signClass(result.total)}`}>
            {signed(result.total, 1)}%
          </div>
        </div>
        <div className="stat">
          <div className="k">Biggest Drag</div>
          <div className="v neg">{result.worstAsset.short}</div>
        </div>
        <div className="stat">
          <div className="k">{bestIsPositive ? "Best Hedge" : "Least Hurt"}</div>
          <div className={`v ${bestIsPositive ? "pos" : ""}`}>
            {result.bestAsset.short}
          </div>
        </div>
      </div>

      <div className="verdict">
        Under <strong>{scenario.label}</strong>, the{" "}
        <strong>{portfolio.label}</strong> portfolio {verb}{" "}
        <strong className={signClass(result.total)}>
          {Math.abs(result.total).toFixed(1)}%
        </strong>
        ; {result.worstAsset.short} was the main drag (
        <strong className="neg">
          {signed(result.worstAsset.contribution, 1)}%
        </strong>
        )
        {bestIsPositive && (
          <>
            {" "}
            and {result.bestAsset.short} provided some shelter (
            <strong className="pos">
              +{result.bestAsset.contribution.toFixed(1)}%
            </strong>
            )
          </>
        )}
        .
      </div>

      <div
        className="output"
        style={{ border: "1px solid var(--rule)", marginTop: 0 }}
      >
        <h4>P&amp;L attribution by asset class</h4>
        <div className="chart-wrap" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
              barCategoryGap={8}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#80848a" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#4a4d51" }}
                axisLine={{ stroke: "#d2ccbe" }}
                tickLine={false}
                width={80}
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
              <Bar dataKey="value" isAnimationActive={false}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.value < 0 ? "#9b3a36" : "#2f6b4f"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <table className="data" style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>Asset Class</th>
              <th className="num">Weight</th>
              <th className="num">Shock</th>
              <th className="num">P&amp;L Impact</th>
            </tr>
          </thead>
          <tbody>
            {result.assets
              .filter((a) => a.weight > 0)
              .map((a) => (
                <tr key={a.name}>
                  <td>{a.name}</td>
                  <td className="num">{a.weight.toFixed(0)}%</td>
                  <td className={`num ${signClass(a.shock)}`}>
                    {signed(a.shock, 0)}%
                  </td>
                  <td className={`num ${signClass(a.contribution)}`}>
                    {signed(a.contribution, 1)}%
                  </td>
                </tr>
              ))}
            <tr className="total">
              <td colSpan={3}>
                <strong>Total</strong>
              </td>
              <td className={`num ${signClass(result.total)}`}>
                <strong>{signed(result.total, 1)}%</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="prose">
        <h3>Why stress testing matters</h3>
        <p>
          The arithmetic is linear: each asset's P&amp;L impact is its weight
          times the scenario shock, so the table reconciles exactly to the total.
          The real insight is what the combination of shocks reveals about the
          portfolio's risk profile.
        </p>
        <p>
          A 60/40 book weathers a typical equity selloff reasonably well because
          long bonds rally — as they did in 2008 and 2020. In 2022, though, bonds
          turned into a second source of loss: the inflation shock repriced
          equities and duration simultaneously. The equity-bond correlation
          flipped positive, and neither leg hedged the other. No optimizer
          trained on pre-2022 history would have priced that tail.
        </p>
        <p>
          Shock estimates are illustrative approximations of each episode's
          direction and magnitude — not reconstructed from any specific index or
          product.
        </p>
      </div>
    </ToolPage>
  );
}
