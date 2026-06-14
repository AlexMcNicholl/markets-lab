import { useMemo } from "react";
import { Link } from "react-router-dom";
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
import { pct, signed, signClass } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import CopyLinkButton from "../components/CopyLinkButton";

const MV = 100_000_000; // $100mm book

type Curve = Record<Tenor, number>;

// A named, non-parallel shock is the whole control surface here: each scenario
// is a set of key-rate moves (in basis points) that the reader applies with one
// click. Shifts are illustrative, not a forecast of any real curve.
interface CurveShock {
  id: string;
  label: string;
  blurb: string;
  shift: Record<Tenor, number>; // basis points at each key rate
}

const SHOCKS: CurveShock[] = [
  {
    id: "parallel-up",
    label: "Parallel +50bp",
    blurb: "The naive view: the whole curve sells off 50bp in lockstep.",
    shift: { 2: 50, 5: 50, 10: 50, 30: 50 },
  },
  {
    id: "bull-steepener",
    label: "Bull steepener",
    blurb: "Front end rallies hard, long end barely moves — the curve steepens.",
    shift: { 2: -60, 5: -35, 10: -15, 30: 5 },
  },
  {
    id: "bear-flattener",
    label: "Bear flattener",
    blurb: "Front end sells off faster than the long end — the curve flattens.",
    shift: { 2: 60, 5: 40, 10: 20, 30: 5 },
  },
  {
    id: "belly-selloff",
    label: "Belly cheapens",
    blurb: "A negative butterfly: 5s and 10s back up while the wings hold.",
    shift: { 2: -10, 5: 45, 10: 40, 30: -10 },
  },
  {
    id: "rally",
    label: "Parallel −50bp",
    blurb: "The mirror image: the whole curve rallies 50bp.",
    shift: { 2: -50, 5: -50, 10: -50, 30: -50 },
  },
];

const DEFAULT_SHOCK = SHOCKS[0].id;

function shockedCurve(shock: CurveShock): Curve {
  const out = { ...BASE_CURVE };
  for (const t of TENORS) out[t] = BASE_CURVE[t] + shock.shift[t] / 100;
  return out;
}

export default function YieldCurve() {
  const [shockId, setShockId] = useSharedState<string>(DEFAULT_SHOCK);
  const shock = SHOCKS.find((s) => s.id === shockId) ?? SHOCKS[0];

  const curve = useMemo(() => shockedCurve(shock), [shock]);
  const result = useMemo(
    () => reprice(DEFAULT_PORTFOLIO, BASE_CURVE, curve, MV),
    [curve],
  );

  // Mean key-rate move, in bp — the "level" the eye reaches for, set against the
  // P&L it fails to explain on a shape move.
  const avgShift =
    TENORS.reduce((s, t) => s + shock.shift[t], 0) / TENORS.length;

  // The key rate carrying the most P&L: where KRD met the biggest yield move.
  const leader = result.byTenor.reduce((a, b) =>
    Math.abs(b.contribPct) > Math.abs(a.contribPct) ? b : a,
  );

  const chartData = TENORS.map((t) => ({
    tenor: `${t}y`,
    Base: BASE_CURVE[t],
    Shocked: curve[t],
  }));

  return (
    <ToolPage
      slug="yield-curve"
      actions={<CopyLinkButton />}
      lede={
        <>
          Reshape the Government of Canada curve and reprice a $100mm bond book
          through its key-rate durations. The point: a parallel-shift mental
          model hides most of the risk — the <em>shape</em> of the move is what
          drives the P&amp;L.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Curve shock</span>
          {SHOCKS.map((s) => (
            <button
              key={s.id}
              className={`preset${shockId === s.id ? " active" : ""}`}
              title={s.blurb}
              onClick={() => setShockId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Total return</div>
          <div className={`v ${signClass(result.totalReturnPct)}`}>
            {pct(result.totalReturnPct)}%
          </div>
        </div>
        <div className="stat">
          <div className="k">P&amp;L on $100mm</div>
          <div className={`v ${signClass(result.pnl)}`}>
            {result.pnl >= 0 ? "+" : "−"}${(Math.abs(result.pnl) / 1e6).toFixed(2)}m
          </div>
        </div>
        <div className="stat">
          <div className="k">Avg curve shift</div>
          <div className="v">{signed(avgShift, 0)}bp</div>
        </div>
      </div>

      <div className="verdict">
        The curve shifted{" "}
        <strong className={signClass(avgShift)}>{signed(avgShift, 0)}bp</strong>{" "}
        on average, and the book{" "}
        {result.totalReturnPct >= 0 ? "gained" : "lost"}{" "}
        <strong className={signClass(result.totalReturnPct)}>
          {pct(Math.abs(result.totalReturnPct))}%
        </strong>
        . Most of it came from the <strong>{leader.tenor}-year</strong> point,
        where {leader.krd.toFixed(1)} years of key-rate duration met a{" "}
        <strong className={signClass(-leader.dy)}>
          {signed(leader.dy * 100, 0)}bp
        </strong>{" "}
        move.
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>Curve shift and repriced book</h4>
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
                dataKey="Shocked"
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
                <td>
                  {r.tenor === leader.tenor ? (
                    <strong>{r.tenor}-year</strong>
                  ) : (
                    `${r.tenor}-year`
                  )}
                </td>
                <td className="num">{r.krd.toFixed(1)}</td>
                <td className={`num ${signClass(-r.dy)}`}>
                  {signed(r.dy * 100, 0)}bp
                </td>
                <td className={`num ${signClass(r.contribPct)}`}>
                  {signed(r.contribPct, 3)}%
                </td>
              </tr>
            ))}
            <tr className="total">
              <td>Total</td>
              <td className="num"></td>
              <td className="num"></td>
              <td className={`num ${signClass(result.totalReturnPct)}`}>
                {signed(result.totalReturnPct, 3)}%
              </td>
            </tr>
          </tbody>
        </table>
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
          The book runs key-rate durations of{" "}
          {DEFAULT_PORTFOLIO.map((p) => `${p.tenor}y ${p.krd.toFixed(1)}`).join(
            " · ",
          )}{" "}
          — an effective duration of {result.effectiveDuration.toFixed(1)} years
          concentrated in the belly. Because that risk is decomposed by maturity,
          a steepener and a flattener of the same average size can produce
          opposite P&amp;L even though a single "duration" number looks unchanged.
          That is the whole reason desks watch curve <em>shape</em>, not just
          level.
        </p>
        <div className="callout">
          <strong>A note on precision:</strong> duration is a first-order
          approximation. For large moves, convexity — the curvature of the
          price-yield relationship — adds a positive second-order term this tool
          deliberately omits to keep the curve-shape intuition front and centre.
        </div>
        <p>
          The credit spread that sits on top of the risk-free rate is decomposed
          in{" "}
          <Link to="/credit-spreads">Credit Spread Decomposition</Link>. To see
          how a rate shock propagates through a whole multi-asset book, see the{" "}
          <Link to="/stress-tester">Portfolio Stress Tester</Link>.
        </p>
      </div>
    </ToolPage>
  );
}
