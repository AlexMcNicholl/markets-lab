import { useMemo, useState } from "react";
import { linkPeriods, Period } from "../lib/attribution";
import { pct, signClass } from "../lib/format";
import Slider from "./Slider";

const INITIAL_PERIODS: Period[] = [
  { label: "Q1", rp: 3.0, rb: 2.2 },
  { label: "Q2", rp: -2.0, rb: -2.6 },
  { label: "Q3", rp: 4.0, rb: 3.1 },
  { label: "Q4", rp: 1.5, rb: 1.2 },
];

/**
 * Interactive illustration of why arithmetic single-period effects don't sum to
 * the realised multi-period active return. Drag each quarter's portfolio and
 * benchmark return and watch the naive sum drift away from the compounded
 * (geometrically linked) truth.
 */
export default function MultiPeriodPanel() {
  const [periods, setPeriods] = useState<Period[]>(INITIAL_PERIODS);
  const link = useMemo(() => linkPeriods(periods), [periods]);

  const update = (i: number, key: "rp" | "rb", v: number) =>
    setPeriods(periods.map((p, idx) => (idx === i ? { ...p, [key]: v } : p)));

  const residual = link.linkedActive - link.naiveSum;

  return (
    <div className="panel mp-panel">
      <div className="controls">
        <div className="controls-head">
          <h4>Quarterly returns</h4>
          <button className="preset" onClick={() => setPeriods(INITIAL_PERIODS)}>
            Reset
          </button>
        </div>
        {periods.map((p, i) => (
          <div key={p.label} className="mp-period">
            <div className="mp-period-label">{p.label}</div>
            <Slider
              dense
              name="Portfolio"
              value={p.rp}
              onChange={(v) => update(i, "rp", v)}
              min={-15}
              max={15}
              step={0.1}
              suffix="%"
              display={(v) => v.toFixed(1)}
            />
            <Slider
              dense
              name="Benchmark"
              value={p.rb}
              onChange={(v) => update(i, "rb", v)}
              min={-15}
              max={15}
              step={0.1}
              suffix="%"
              display={(v) => v.toFixed(1)}
            />
          </div>
        ))}
      </div>

      <div className="output">
        <h4>Arithmetic vs. geometric</h4>
        <div className="stats">
          <div className="stat">
            <div className="k">Σ quarterly active</div>
            <div className={`v ${signClass(link.naiveSum)}`}>{pct(link.naiveSum)}%</div>
          </div>
          <div className="stat">
            <div className="k">Linked (geometric) active</div>
            <div className={`v ${signClass(link.linkedActive)}`}>
              {pct(link.linkedActive)}%
            </div>
          </div>
          <div className="stat">
            <div className="k">Compounded portfolio</div>
            <div className="v">{pct(link.geometricRp)}%</div>
          </div>
          <div className="stat">
            <div className="k">Compounded benchmark</div>
            <div className="v">{pct(link.geometricRb)}%</div>
          </div>
        </div>

        <table className="data">
          <thead>
            <tr>
              <th>Period</th>
              <th className="num">Portfolio</th>
              <th className="num">Benchmark</th>
              <th className="num">Active</th>
            </tr>
          </thead>
          <tbody>
            {link.rows.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td className="num">{pct(r.rp, 1)}</td>
                <td className="num">{pct(r.rb, 1)}</td>
                <td className={`num ${signClass(r.active)}`}>{pct(r.active, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="callout" style={{ marginBottom: 0 }}>
          <strong>Linking residual: {pct(residual, 2)}%.</strong> Adding the
          quarterly active returns gives {pct(link.naiveSum)}%, but the realised
          compounded active return is {pct(link.linkedActive)}%. Linking
          algorithms — Carino, Menchero, GRAP — distribute exactly this residual
          back onto each period's effects so a multi-period attribution still
          reconciles to performance. Getting it wrong is the most common error
          in home-grown attribution.
        </div>
      </div>
    </div>
  );
}
