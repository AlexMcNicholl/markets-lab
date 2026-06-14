import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ASSETS, TARGET, resampleFrontier } from "../lib/frontier";
import { pct } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import CopyLinkButton from "../components/CopyLinkButton";

// The one live input is how much history you have to estimate returns from —
// folded into a handful of presets. Fewer years means a larger standard error
// on every expected return, so the cloud of "optimal" portfolios widens.
interface Preset {
  id: string;
  label: string;
  blurb: string;
  years: number;
}

const PRESETS: Preset[] = [
  {
    id: "y5",
    label: "5 years",
    blurb: "A typical track record. Expected returns are barely pinned down.",
    years: 5,
  },
  {
    id: "y15",
    label: "15 years",
    blurb: "A full cycle of data — and still a wide cloud.",
    years: 15,
  },
  {
    id: "y30",
    label: "30 years",
    blurb: "A long history most asset classes don't have.",
    years: 30,
  },
  {
    id: "perfect",
    label: "Perfect inputs",
    blurb: "No estimation error at all — what the textbook quietly assumes.",
    years: 100_000,
  },
];

const DEFAULT_YEARS = PRESETS[0].years;

// Weight as a signed whole-percent string, e.g. "71%", "−40%".
const wpct = (f: number) => `${pct(f * 100, 0)}%`;

export default function EfficientFrontier() {
  const [years, setYears] = useSharedState<number>(DEFAULT_YEARS);
  const active = PRESETS.find((p) => p.years === years) ?? PRESETS[0];

  const sim = useMemo(() => resampleFrontier(years), [years]);
  const isPerfect = years >= 1000;

  const top = ASSETS[sim.topAsset];
  const topW = sim.weights[sim.topAsset];
  const wide = ASSETS[sim.widest];
  const wideW = sim.weights[sim.widest];
  const swingPts = (wideW.hi - wideW.lo) * 100;

  return (
    <ToolPage
      slug="efficient-frontier"
      actions={<CopyLinkButton />}
      lede={
        <>
          Mean-variance optimization turns expected returns and a covariance
          matrix into one confident set of weights. But those inputs are{" "}
          <em>estimates</em>. Feed the optimizer the estimation error you
          actually have, re-run it 500 times, and the single "optimal" answer
          dissolves into a cloud — then average the cloud back into a portfolio
          you'd actually hold.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Data behind the estimate</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset${active.id === p.id ? " active" : ""}`}
              title={p.blurb}
              onClick={() => setYears(p.years)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Optimizer's top bet — {top.short}</div>
          <div className="v">{wpct(topW.textbook)}</div>
        </div>
        <div className="stat">
          <div className="k">Resampled, same asset</div>
          <div className="v">{wpct(topW.resampled)}</div>
        </div>
        <div className="stat">
          <div className="k">Widest swing — {wide.short}</div>
          <div className="v">{isPerfect ? "0pts" : `${swingPts.toFixed(0)}pts`}</div>
        </div>
      </div>

      <div className="verdict">
        {isPerfect ? (
          <>
            With perfect inputs there is nothing to estimate, so every run lands
            on the same portfolio: the optimizer's <strong>{top.short}</strong>{" "}
            weight of <strong>{wpct(topW.textbook)}</strong> is rock-steady. Drop
            to a real track record and that certainty evaporates.
          </>
        ) : (
          <>
            With {active.label.toLowerCase()} of data, the optimizer puts{" "}
            <strong>{wpct(topW.textbook)}</strong> in <strong>{top.name}</strong>{" "}
            and calls it optimal. Re-estimate the inputs 500 times and that
            position swings from <strong>{wpct(topW.lo)}</strong> to{" "}
            <strong>{wpct(topW.hi)}</strong>. Averaging every run pulls it back to
            a <strong>{wpct(topW.resampled)}</strong> holding you'd actually live
            with.
          </>
        )}
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>Risk, return, and the cloud of "optimal" answers</h4>
        <div className="chart-wrap" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, left: -4, bottom: 4 }}>
              <XAxis
                type="number"
                dataKey="risk"
                domain={[3, 26]}
                tick={{ fontSize: 11, fill: "#80848a" }}
                axisLine={{ stroke: "#d2ccbe" }}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                label={{
                  value: "Risk (volatility)",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 11,
                  fill: "#80848a",
                }}
              />
              <YAxis
                type="number"
                dataKey="ret"
                domain={[2, 10]}
                tick={{ fontSize: 11, fill: "#80848a" }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v) => `${v}%`}
              />
              <ZAxis range={[40, 40]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
                contentStyle={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  border: "1px solid #d2ccbe",
                  borderRadius: 2,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Scatter
                name="Plausible portfolios"
                data={sim.cloud}
                fill="#1f4a5c"
                fillOpacity={0.13}
                shape="circle"
              />
              <Scatter
                name="Efficient frontier"
                data={sim.frontier}
                fill="none"
                line={{ stroke: "#b9b2a3", strokeWidth: 1.5, strokeDasharray: "4 3" }}
                lineType="joint"
                shape={() => <g />}
              />
              <Scatter
                name="Optimizer's pick"
                data={[sim.textbookPoint]}
                fill="#1f4a5c"
              />
              <Scatter
                name="Resampled portfolio"
                data={[sim.resampledPoint]}
                fill="#9b3a36"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <table className="data" style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>Asset class</th>
              <th className="num">Optimizer</th>
              <th className="num">Resampled</th>
              <th className="num">Range across runs</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a, i) => {
              const w = sim.weights[i];
              return (
                <tr key={a.name} className={i === sim.topAsset ? "is-leader" : ""}>
                  <td>
                    {i === sim.topAsset ? <strong>{a.name}</strong> : a.name}
                  </td>
                  <td className="num">{wpct(w.textbook)}</td>
                  <td className="num">{wpct(w.resampled)}</td>
                  <td className="num">
                    {isPerfect ? "—" : `${wpct(w.lo)} – ${wpct(w.hi)}`}
                  </td>
                </tr>
              );
            })}
            <tr className="total">
              <td>Total</td>
              <td className="num">100%</td>
              <td className="num">100%</td>
              <td className="num"></td>
            </tr>
          </tbody>
        </table>
        <div className="note">
          The cloud is 500 portfolios, each optimal for one re-estimate of the
          inputs and then scored on the true ones — so it sits below the true
          frontier. The optimizer's pick and the resampled (averaged) portfolio
          are marked.
        </div>
      </div>

      <div className="prose">
        <h3>How it's calculated</h3>
        <p>
          The optimizer minimizes portfolio variance subject to hitting a{" "}
          {TARGET}% target return while staying fully invested. That constrained
          problem has a closed form — a fixed blend of two portfolios,{" "}
          Σ<sup>−1</sup>1 and Σ<sup>−1</sup>μ — so the weights always sum to one
          but are otherwise free to go short:
        </p>
        <div className="formula">
          minimize wᵀΣw &nbsp; s.t. &nbsp; wᵀμ = {TARGET}%, &nbsp; wᵀ1 = 1
          <br />⟹&nbsp; w* = Σ<sup>−1</sup>(γ · 1 + δ · μ)
        </div>
        <p>
          The catch is μ. An expected return estimated from <code>T</code> years
          of data carries a standard error of about <code>σ / √T</code> — and
          with the volatilities of real assets, even a few decades barely move
          that error below the return premia themselves. So we draw 500 plausible
          estimates from that sampling distribution, re-optimize each, and look at
          the spread of "optimal" weights.
        </p>

        <h3>Why the optimizer's confidence is mostly noise</h3>
        <p>
          Mean-variance optimization is an <em>error-maximizer</em>: it loads up
          on whichever asset's return happened to be estimated highest and shorts
          whichever came out lowest, so tiny input changes produce wildly
          different portfolios. Averaging the weights across all the resamples —
          Michaud's resampled efficiency — cancels most of that noise and yields a
          smoother, more diversified portfolio that barely moves when the data
          does. It rarely sits exactly on the textbook frontier, but it is the one
          you can actually hold through the next estimate.
        </p>
        <div className="callout">
          <strong>A note on constraints:</strong> this version is unconstrained,
          so the optimizer is free to short — which is why some weights run
          negative and the swings look extreme. Real mandates add long-only and
          position limits that cap the damage, but they dampen the instability
          rather than remove it; the inputs are still estimates.
        </div>
        <p>
          <Link to="/black-litterman">Black-Litterman</Link> addresses the
          estimation-error problem differently — instead of resampling, it
          anchors the optimizer to market-implied returns and blends in views in
          proportion to your conviction. The FX dimension of a global allocation
          is in{" "}
          <Link to="/currency-hedging">Currency Hedging for Canadians</Link>.
        </p>
      </div>
    </ToolPage>
  );
}
