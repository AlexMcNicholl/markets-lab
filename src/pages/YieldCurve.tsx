import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  BASE_CURVE,
  DEFAULT_PORTFOLIO,
  reprice,
  TENORS,
  Tenor,
} from "../lib/bonds";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import Slider from "../components/Slider";
import CopyLinkButton from "../components/CopyLinkButton";

const MV = 100_000_000; // $100mm book

type Curve = Record<Tenor, number>;

const PRESETS: Record<string, (b: Curve) => Curve> = {
  "Parallel +50bp": (b) => mapCurve(b, () => 0.5),
  "Bull steepener": (b) => mapCurve(b, (t) => (t <= 2 ? -0.6 : t >= 30 ? 0.1 : -0.25)),
  "Bear flattener": (b) => mapCurve(b, (t) => (t <= 2 ? 0.6 : t >= 30 ? 0.05 : 0.3)),
  Butterfly: (b) => mapCurve(b, (t) => (t === 5 || t === 10 ? 0.4 : -0.25)),
};

function mapCurve(base: Curve, shift: (t: Tenor) => number): Curve {
  const out = { ...base };
  for (const t of TENORS) out[t] = base[t] + shift(t);
  return out;
}

export default function YieldCurve() {
  const [curve, setCurve, resetCurve] = useSharedState<Curve>(BASE_CURVE);
  const [active, setActive] = useState<string | null>(null);

  const result = useMemo(
    () => reprice(DEFAULT_PORTFOLIO, BASE_CURVE, curve, MV),
    [curve],
  );

  const setTenor = (t: Tenor, v: number) => {
    setActive(null);
    setCurve({ ...curve, [t]: v });
  };

  const applyPreset = (name: string) => {
    setActive(name);
    setCurve(PRESETS[name]({ ...BASE_CURVE }));
  };

  const reset = () => {
    setActive(null);
    resetCurve();
  };

  const chartData = TENORS.map((t) => ({
    tenor: `${t}y`,
    Base: BASE_CURVE[t],
    Current: curve[t],
  }));

  return (
    <ToolPage
      slug="yield-curve"
      actions={<CopyLinkButton />}
      lede={
        <>
          Reshape the Government of Canada curve and reprice a $100mm bond book
          through its key-rate durations. The point: a parallel-shift mental
          model hides most of the risk — the shape of the move is what drives
          the P&L.
        </>
      }
    >
      <div className="panel">
        <div className="controls">
          <h4>Curve shape</h4>
          <div className="btn-row">
            {Object.keys(PRESETS).map((name) => (
              <button
                key={name}
                className={`preset ${active === name ? "active" : ""}`}
                onClick={() => applyPreset(name)}
              >
                {name}
              </button>
            ))}
            <button className="preset" onClick={reset}>
              Reset
            </button>
          </div>
          {TENORS.map((t) => {
            const delta = curve[t] - BASE_CURVE[t];
            return (
              <Slider
                key={t}
                name={`${t}-year`}
                value={curve[t]}
                min={1}
                max={6}
                step={0.05}
                suffix="%"
                display={(v) => v.toFixed(2)}
                meta={
                  <span
                    className={delta >= 0 ? "pos" : "neg"}
                    style={{ marginLeft: 8, fontSize: 11 }}
                  >
                    {delta >= 0 ? "+" : "−"}
                    {Math.abs(delta * 100).toFixed(0)}bp
                  </span>
                }
                onChange={(v) => setTenor(t, v)}
              />
            );
          })}
          <div className="note">
            Portfolio key-rate durations:{" "}
            {DEFAULT_PORTFOLIO.map((p) => `${p.tenor}y ${p.krd.toFixed(1)}`).join(
              " · ",
            )}
            . Effective duration {result.effectiveDuration.toFixed(1)} years.
          </div>
        </div>

        <div className="output">
          <h4>Repriced book</h4>
          <div className="stats">
            <div className="stat">
              <div className="k">Total return</div>
              <div className={`v ${result.totalReturnPct >= 0 ? "pos" : "neg"}`}>
                {result.totalReturnPct >= 0 ? "+" : "−"}
                {Math.abs(result.totalReturnPct).toFixed(2)}%
              </div>
            </div>
            <div className="stat">
              <div className="k">P&amp;L on $100mm</div>
              <div className={`v ${result.pnl >= 0 ? "pos" : "neg"}`}>
                {result.pnl >= 0 ? "+" : "−"}$
                {(Math.abs(result.pnl) / 1e6).toFixed(2)}m
              </div>
            </div>
          </div>

          <div className="chart-wrap" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <XAxis
                  dataKey="tenor"
                  tick={{ fontSize: 11, fill: "#80848a" }}
                  axisLine={{ stroke: "#d2ccbe" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[2.5, 4.5]}
                  tick={{ fontSize: 11, fill: "#80848a" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v) => `${v.toFixed(1)}%`}
                />
                <Tooltip
                  formatter={(v: number) => `${v.toFixed(2)}%`}
                  contentStyle={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    border: "1px solid #d2ccbe",
                    borderRadius: 2,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="Base"
                  stroke="#b9b2a3"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  strokeDasharray="4 3"
                />
                <Line
                  type="monotone"
                  dataKey="Current"
                  stroke="#1f4a5c"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <table className="data" style={{ marginTop: 18 }}>
            <thead>
              <tr>
                <th>Key rate</th>
                <th className="num">KRD</th>
                <th className="num">Δ yield</th>
                <th className="num">Return contrib.</th>
              </tr>
            </thead>
            <tbody>
              {result.byTenor.map((r) => (
                <tr key={r.tenor}>
                  <td>{r.tenor}-year</td>
                  <td className="num">{r.krd.toFixed(1)}</td>
                  <td className={`num ${r.dy >= 0 ? "neg" : "pos"}`}>
                    {r.dy >= 0 ? "+" : "−"}
                    {Math.abs(r.dy * 100).toFixed(0)}bp
                  </td>
                  <td className={`num ${r.contribPct >= 0 ? "pos" : "neg"}`}>
                    {r.contribPct >= 0 ? "+" : "−"}
                    {Math.abs(r.contribPct).toFixed(3)}%
                  </td>
                </tr>
              ))}
              <tr className="total">
                <td>Total</td>
                <td className="num"></td>
                <td className="num"></td>
                <td className={`num ${result.totalReturnPct >= 0 ? "pos" : "neg"}`}>
                  {result.totalReturnPct >= 0 ? "+" : "−"}
                  {Math.abs(result.totalReturnPct).toFixed(3)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="prose">
        <h3>How it's calculated</h3>
        <p>
          Each position contributes a price change equal to minus its key-rate
          duration times the yield move at that point on the curve. Sum the
          contributions and you have the book's return:
        </p>
        <div className="formula">ΔP / P ≈ − Σ KRD<sub>i</sub> × Δy<sub>i</sub></div>
        <p>
          Key-rate durations decompose interest-rate risk by maturity, so a
          steepener and a flattener of the same magnitude can produce opposite
          P&amp;L even though a single "duration" number looks unchanged. That's
          the whole reason desks watch curve <em>shape</em>, not just level.
        </p>
        <div className="callout">
          <strong>A note on precision:</strong> duration is a first-order
          approximation. For large moves, convexity — the curvature of the
          price-yield relationship — adds a positive second-order term this tool
          deliberately omits to keep the curve-shape intuition front and centre.
        </div>
      </div>
    </ToolPage>
  );
}
