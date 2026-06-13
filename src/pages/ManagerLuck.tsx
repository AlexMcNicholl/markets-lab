import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { makeRng, normal, yearsToSignificance, quantile } from "../lib/stats";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import Slider from "../components/Slider";
import CopyLinkButton from "../components/CopyLinkButton";

const N = 1000;

interface State {
  skillBps: number; // true annual alpha, bps
  te: number; // tracking error, % per year
  years: number;
  seed: number;
}

const DEFAULTS: State = { skillBps: 0, te: 4, years: 5, seed: 12345 };

export default function ManagerLuck() {
  const [state, setState, reset] = useSharedState<State>(DEFAULTS);
  const { skillBps, te, years, seed } = state;

  const sim = useMemo(() => {
    const rng = makeRng(seed);
    const alpha = skillBps / 100; // bps → %
    const annualized: number[] = [];
    const streaks: boolean[] = []; // beat benchmark every single year

    for (let m = 0; m < N; m++) {
      let cumLog = 0;
      let beatEvery = true;
      for (let y = 0; y < years; y++) {
        const excess = alpha + te * normal(rng);
        if (excess <= 0) beatEvery = false;
        cumLog += Math.log(1 + excess / 100);
      }
      const ann = (Math.exp(cumLog / years) - 1) * 100;
      annualized.push(ann);
      streaks.push(beatEvery);
    }

    annualized.sort((a, b) => a - b);
    const beatEveryYear = streaks.filter(Boolean).length;
    const topDecile = quantile(annualized, 0.9);
    const median = quantile(annualized, 0.5);
    const best = annualized[annualized.length - 1];

    // Histogram
    const lo = Math.floor(annualized[0]);
    const hi = Math.ceil(annualized[annualized.length - 1]);
    const buckets = 24;
    const width = (hi - lo) / buckets || 1;
    const hist = Array.from({ length: buckets }, (_, i) => ({
      x: lo + width * (i + 0.5),
      label: (lo + width * (i + 0.5)).toFixed(1),
      count: 0,
    }));
    for (const a of annualized) {
      let idx = Math.floor((a - lo) / width);
      if (idx >= buckets) idx = buckets - 1;
      if (idx < 0) idx = 0;
      hist[idx].count++;
    }

    const ir = te > 0 ? alpha / te : 0;
    const nNeeded = yearsToSignificance(ir);

    return { annualized, beatEveryYear, topDecile, median, best, hist, ir, nNeeded };
  }, [skillBps, te, years, seed]);

  return (
    <ToolPage
      slug="manager-luck"
      actions={<CopyLinkButton />}
      lede={
        <>
          Spin up {N.toLocaleString()} managers, each with the true skill you
          set. Then look at who came out on top. The uncomfortable part: set
          skill to zero and the leaderboard still looks impressive — those are
          the managers marketing departments are built around.
        </>
      }
    >
      <div className="panel">
        <div className="controls">
          <h4>Assumptions</h4>
          <Slider
            name="True skill (alpha)"
            value={skillBps}
            min={0}
            max={300}
            step={10}
            suffix=" bps"
            onChange={(v) => setState({ ...state, skillBps: v })}
          />
          <Slider
            name="Tracking error"
            value={te}
            min={1}
            max={10}
            step={0.5}
            suffix="%"
            display={(v) => v.toFixed(1)}
            onChange={(v) => setState({ ...state, te: v })}
          />
          <Slider
            name="Track record"
            value={years}
            min={1}
            max={20}
            step={1}
            suffix=" yrs"
            onChange={(v) => setState({ ...state, years: v })}
          />
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button
              className="preset"
              onClick={() => setState({ ...state, seed: seed + 1 })}
            >
              ↻ New random universe
            </button>
            <button className="preset" onClick={reset}>
              Reset
            </button>
          </div>
          <div className="note">
            Each manager's annual excess return is drawn from a normal
            distribution centred on their true skill with the chosen tracking
            error. Information ratio ={" "}
            <span className="num">{sim.ir.toFixed(2)}</span>.
          </div>
        </div>

        <div className="output">
          <h4>The leaderboard after {years} years</h4>
          <div className="stats">
            <div className="stat">
              <div className="k">Beat index every year</div>
              <div className="v">{sim.beatEveryYear}</div>
            </div>
            <div className="stat">
              <div className="k">Top-decile alpha</div>
              <div className="v">{sim.topDecile.toFixed(2)}%</div>
            </div>
            <div className="stat">
              <div className="k">Best of {N}</div>
              <div className="v">{sim.best.toFixed(2)}%</div>
            </div>
            <div className="stat">
              <div className="k">Median</div>
              <div className="v">{sim.median.toFixed(2)}%</div>
            </div>
          </div>

          <div className="chart-wrap" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sim.hist} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#80848a" }}
                  axisLine={{ stroke: "#d2ccbe" }}
                  tickLine={false}
                  interval={3}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => [`${v} managers`, "Count"]}
                  labelFormatter={(l) => `${l}% annualized`}
                  contentStyle={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    border: "1px solid #d2ccbe",
                    borderRadius: 2,
                  }}
                />
                <ReferenceLine x="0.0" stroke="#9b3a36" />
                <Bar dataKey="count">
                  {sim.hist.map((b, i) => (
                    <Cell key={i} fill={b.x >= 0 ? "#1f4a5c" : "#b9b2a3"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="note">
            Distribution of annualized excess return across all {N} managers.
            Bars right of zero outperformed; the spread is the range a selection
            committee sees as a track record.
          </div>

          <div className="callout" style={{ marginTop: 22 }}>
            <strong>
              {sim.nNeeded === Infinity
                ? "With zero true skill, no track record is ever long enough."
                : `At this skill and tracking error, it would take about ${Math.ceil(
                    sim.nNeeded,
                  )} years of data to distinguish this manager from luck at 95% confidence.`}
            </strong>{" "}
            {sim.nNeeded !== Infinity && sim.nNeeded > years && (
              <>
                You're judging on {years}. The leaderboard above is mostly
                noise.
              </>
            )}
          </div>
        </div>
      </div>

      <div className="prose">
        <h3>Why the math is brutal</h3>
        <p>
          A manager's edge shows up as alpha, but it's buried in tracking-error
          noise. The signal-to-noise ratio of an annualized track record is just
          the information ratio scaled by time: the t-statistic of measured
          alpha after <code>n</code> years is{" "}
          <code>IR × √n</code>. To clear the usual 95% bar you need a t-stat near
          2, so:
        </p>
        <div className="formula">
          years to significance = (1.96 / IR)²
        </div>
        <p>
          A genuinely good active manager might run an information ratio of 0.5.
          That implies roughly <strong>16 years</strong> of data before you can
          statistically separate them from a coin flip — far longer than the
          three- to five-year records most hiring and firing decisions rest on.
          Push skill to zero and the requirement becomes infinite: there is
          nothing to detect, yet a thousand-manager universe still throws up a
          handful who beat the benchmark every single year by chance alone.
        </p>
        <div className="callout">
          <strong>The practical point for manager selection:</strong> a short
          record of outperformance is weak evidence on its own. It's why serious
          diligence leans on understanding the <em>process</em> — repeatable
          edge, risk discipline, consistency of approach — rather than
          extrapolating a star's recent numbers.
        </div>
      </div>
    </ToolPage>
  );
}
