import { useMemo } from "react";
import { Link } from "react-router-dom";
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
import { PRESETS, getPreset, runBL } from "../lib/blacklitterman";
import { pct, signed, signClass } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import Slider from "../components/Slider";
import CopyLinkButton from "../components/CopyLinkButton";

interface ToolState {
  v: string; // preset id
  c: number; // view confidence, %
}

const DEFAULT_STATE: ToolState = { v: "em", c: 60 };

export default function BlackLitterman() {
  const [state, setState] = useSharedState<ToolState>(DEFAULT_STATE);

  const preset = getPreset(state.v);
  const hasViews = preset.views.length > 0;

  const result = useMemo(() => runBL(preset, state.c), [preset, state.c]);

  const chartData = result.assets.map((a) => ({
    name: a.short,
    value: a.tilt,
  }));

  return (
    <ToolPage
      slug="black-litterman"
      actions={<CopyLinkButton />}
      lede={
        <>
          A directional view only earns a position if you're willing to back it
          with conviction. Black-Litterman starts from the returns the market
          implicitly prices at today's weights, blends in a view at whatever
          confidence you dial, and shows exactly what position size that
          conviction justifies. Pick a view below, then move the slider.
        </>
      }
    >
      <div
        className="toolbar"
        style={{ flexDirection: "column", alignItems: "flex-start" }}
      >
        <div className="scenario-row">
          <span className="toolbar-label">View</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset${state.v === p.id ? " active" : ""}`}
              title={p.blurb}
              onClick={() => setState({ ...state, v: p.id })}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ width: "100%", maxWidth: 320, opacity: hasViews ? 1 : 0.4 }}>
          <Slider
            name="View confidence"
            value={state.c}
            min={5}
            max={95}
            step={5}
            suffix="%"
            onChange={(c) => setState({ ...state, c })}
          />
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Top Overweight</div>
          <div className={`v ${result.topOver.tilt > 0.05 ? "pos" : ""}`}>
            {result.topOver.tilt > 0.05 ? result.topOver.short : "—"}
          </div>
        </div>
        <div className="stat">
          <div className="k">Top Underweight</div>
          <div className={`v ${result.topUnder.tilt < -0.05 ? "neg" : ""}`}>
            {result.topUnder.tilt < -0.05 ? result.topUnder.short : "—"}
          </div>
        </div>
        <div className="stat">
          <div className="k">Active Risk</div>
          <div className="v">{pct(result.activeRisk, 2)}%</div>
        </div>
      </div>

      <div className="verdict">
        {hasViews ? (
          <>
            At <strong>{state.c}%</strong> confidence in the{" "}
            <strong>{preset.label}</strong> view, the optimizer tilts{" "}
            <strong className={signClass(result.topOver.tilt)}>
              {signed(result.topOver.tilt, 1)} pts
            </strong>{" "}
            into <strong>{result.topOver.name}</strong> (funded mainly from{" "}
            <strong>{result.topUnder.name}</strong>), taking on{" "}
            <strong>{pct(result.activeRisk, 2)}%</strong> of active risk versus
            the market portfolio.
          </>
        ) : (
          <>
            With no views, the posterior <em>is</em> the market portfolio - every
            tilt is zero and active risk is{" "}
            <strong>{pct(result.activeRisk, 2)}%</strong>. This is the baseline a
            view has to overcome.
          </>
        )}
      </div>

      <div
        className="output"
        style={{ border: "1px solid var(--rule)", marginTop: 0 }}
      >
        <h4>Active tilt vs. the market portfolio</h4>
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
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#4a4d51" }}
                axisLine={{ stroke: "#d2ccbe" }}
                tickLine={false}
                width={64}
              />
              <Tooltip
                formatter={(v: number) => `${signed(v, 1)} pts`}
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
                  <Cell key={i} fill={entry.value < 0 ? "#9b3a36" : "#2f6b4f"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <table className="data" style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>Asset Class</th>
              <th className="num">Mkt wt</th>
              <th className="num">Eq. return</th>
              <th className="num">BL return</th>
              <th className="num">Active tilt</th>
            </tr>
          </thead>
          <tbody>
            {result.assets.map((a) => (
              <tr key={a.id} className={a.id === result.leader ? "is-leader" : undefined}>
                <td>{a.name}</td>
                <td className="num">{a.wEq.toFixed(0)}%</td>
                <td className="num">{pct(a.piRet, 2)}%</td>
                <td className={`num ${signClass(a.blRet - a.piRet)}`}>
                  {pct(a.blRet, 2)}%
                </td>
                <td className={`num ${signClass(a.tilt)}`}>
                  {Math.abs(a.tilt) < 0.05 ? "—" : `${signed(a.tilt, 1)} pts`}
                </td>
              </tr>
            ))}
            <tr className="total">
              <td>Total</td>
              <td className="num">100%</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">0.0 pts</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="prose">
        <h3>How it's calculated</h3>
        <p>
          Black-Litterman runs the optimizer backwards first. Given market-cap
          weights and a covariance matrix, it solves Π&nbsp;=&nbsp;δΣw for the{" "}
          <em>equilibrium</em> excess returns - the returns you'd have to believe
          for today's market weights to be optimal. That anchor is the "Eq.
          return" column, and it's why doing nothing reproduces the market
          portfolio exactly.
        </p>
        {hasViews && (
          <p>
            The active view{preset.views.length > 1 ? "s" : ""} here:{" "}
            {preset.views.map((v, i) => (
              <span key={i}>
                {i > 0 ? "; " : ""}
                <em>{v.label.toLowerCase()}</em>
              </span>
            ))}
            . Each view is blended with the equilibrium in proportion to its
            confidence, nudging the posterior "BL return" away from the anchor.
            Run those posterior returns back through the optimizer and the weights
            tilt - every percentage point in the last column traces directly to a
            return the view moved.
          </p>
        )}
        <p>
          The confidence slider is the whole lesson. At low confidence the views
          barely register and the book stays close to market weights; crank it up
          and the same view drives an outsized position and a larger tracking
          error. A view only earns a position when you're willing to back it —
          and the slider makes that price explicit. The universe, volatilities,
          and correlations are illustrative figures, not any real index or
          product.
        </p>
        <p>
          For context on why the unconstrained optimizer is so sensitive to input
          error, see the{" "}
          <Link to="/efficient-frontier">Resampled Efficient Frontier</Link>. The
          FX layer on a global book is in{" "}
          <Link to="/currency-hedging">Currency Hedging for Canadians</Link>.
        </p>
      </div>
    </ToolPage>
  );
}
