import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { attribute, carinoCheck, Sector } from "../lib/attribution";

const INITIAL: Sector[] = [
  { name: "Financials", wp: 32, wb: 28, rp: 4.1, rb: 3.2 },
  { name: "Energy", wp: 14, wb: 18, rp: -2.0, rb: -1.4 },
  { name: "Materials", wp: 10, wb: 11, rp: 6.5, rb: 5.0 },
  { name: "Industrials", wp: 16, wb: 14, rp: 2.2, rb: 2.6 },
  { name: "Technology", wp: 20, wb: 17, rp: 8.0, rb: 7.1 },
  { name: "Utilities", wp: 8, wb: 12, rp: 1.0, rb: 1.3 },
];

const pct = (v: number, d = 2) => `${v >= 0 ? "" : "−"}${Math.abs(v).toFixed(d)}`;
const cls = (v: number) => (v >= 0 ? "pos" : "neg");

export default function Attribution() {
  const [sectors, setSectors] = useState<Sector[]>(INITIAL);

  const result = useMemo(() => attribute(sectors), [sectors]);
  const wpSum = sectors.reduce((s, x) => s + x.wp, 0);
  const wbSum = sectors.reduce((s, x) => s + x.wb, 0);

  const update = (i: number, key: keyof Sector, v: number) => {
    setSectors((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [key]: v } : s)),
    );
  };

  const chartData = result.effects.map((e) => ({
    name: e.name,
    Allocation: e.allocation,
    Selection: e.selection,
    Interaction: e.interaction,
  }));

  // Multi-period illustration: the same active return repeated over four
  // periods, summed arithmetically vs. linked geometrically.
  const periodRp = [3.0, -2.0, 4.0, 1.5];
  const periodRb = [2.2, -2.6, 3.1, 1.2];
  const periodActive = periodRp.map((r, i) => r - periodRb[i]);
  const carino = carinoCheck(periodActive, periodRp, periodRb);

  return (
    <div className="wrap tool-page">
      <Link to="/" className="back">
        ← All tools
      </Link>
      <h1>Attribution Playground</h1>
      <p className="lede">
        A single-period Brinson-Fachler decomposition. Change what the portfolio
        owns relative to its benchmark, and watch active return split into the
        bet on <em>where</em> to be (allocation) and the bet on <em>what</em> to
        hold within each sector (selection).
      </p>

      <div className="panel">
        <div className="controls">
          <h4>Sector inputs</h4>
          {sectors.map((s, i) => (
            <div key={s.name} style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: 8,
                }}
              >
                {s.name}
              </div>
              <Field
                label="Port. weight"
                value={s.wp}
                onChange={(v) => update(i, "wp", v)}
                min={0}
                max={50}
                step={1}
                suffix="%"
              />
              <Field
                label="Bench. weight"
                value={s.wb}
                onChange={(v) => update(i, "wb", v)}
                min={0}
                max={50}
                step={1}
                suffix="%"
              />
              <Field
                label="Port. return"
                value={s.rp}
                onChange={(v) => update(i, "rp", v)}
                min={-15}
                max={15}
                step={0.1}
                suffix="%"
              />
              <Field
                label="Bench. return"
                value={s.rb}
                onChange={(v) => update(i, "rb", v)}
                min={-15}
                max={15}
                step={0.1}
                suffix="%"
              />
            </div>
          ))}
          <div className="note">
            Portfolio weights sum to{" "}
            <span className={Math.abs(wpSum - 100) < 0.5 ? "pos" : "neg"}>
              {wpSum.toFixed(0)}%
            </span>{" "}
            · benchmark{" "}
            <span className={Math.abs(wbSum - 100) < 0.5 ? "pos" : "neg"}>
              {wbSum.toFixed(0)}%
            </span>
            . Returns are normalised by total weight, so effects stay coherent
            while you drag.
          </div>
        </div>

        <div className="output">
          <h4>Active return decomposition</h4>
          <div className="stats">
            <div className="stat">
              <div className="k">Portfolio</div>
              <div className="v">{pct(result.Rp)}%</div>
            </div>
            <div className="stat">
              <div className="k">Benchmark</div>
              <div className="v">{pct(result.Rb)}%</div>
            </div>
            <div className="stat">
              <div className="k">Active</div>
              <div className={`v ${cls(result.active)}`}>
                {pct(result.active)}%
              </div>
            </div>
          </div>

          <div className="chart-wrap" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#80848a" }}
                  axisLine={{ stroke: "#d2ccbe" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#80848a" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v) => `${v.toFixed(1)}%`}
                />
                <Tooltip
                  formatter={(v: number) => `${v.toFixed(3)}%`}
                  contentStyle={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    border: "1px solid #d2ccbe",
                    borderRadius: 2,
                  }}
                />
                <ReferenceLine y={0} stroke="#80848a" />
                <Bar dataKey="Allocation" stackId="a" fill="#1f4a5c" />
                <Bar dataKey="Selection" stackId="a" fill="#2f6b80" />
                <Bar dataKey="Interaction" stackId="a" fill="#b08433">
                  {chartData.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="data" style={{ marginTop: 18 }}>
            <thead>
              <tr>
                <th>Sector</th>
                <th className="num">Allocation</th>
                <th className="num">Selection</th>
                <th className="num">Interaction</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {result.effects.map((e) => (
                <tr key={e.name}>
                  <td>{e.name}</td>
                  <td className={`num ${cls(e.allocation)}`}>{pct(e.allocation, 3)}</td>
                  <td className={`num ${cls(e.selection)}`}>{pct(e.selection, 3)}</td>
                  <td className={`num ${cls(e.interaction)}`}>{pct(e.interaction, 3)}</td>
                  <td className={`num ${cls(e.total)}`}>{pct(e.total, 3)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>Total</td>
                <td className={`num ${cls(result.totals.allocation)}`}>
                  {pct(result.totals.allocation, 3)}
                </td>
                <td className={`num ${cls(result.totals.selection)}`}>
                  {pct(result.totals.selection, 3)}
                </td>
                <td className={`num ${cls(result.totals.interaction)}`}>
                  {pct(result.totals.interaction, 3)}
                </td>
                <td className={`num ${cls(result.active)}`}>{pct(result.active, 3)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="prose">
        <h3>How it's calculated</h3>
        <p>
          For each sector, the three effects come from the standard
          Brinson-Fachler identity, with the benchmark's total return as the
          hurdle that makes allocation a relative bet:
        </p>
        <div className="formula">
          allocation = (w<sub>P</sub> − w<sub>B</sub>) × (r<sub>B</sub> −
          R<sub>B</sub>)
          <br />
          selection&nbsp;&nbsp;= w<sub>B</sub> × (r<sub>P</sub> − r<sub>B</sub>)
          <br />
          interaction = (w<sub>P</sub> − w<sub>B</sub>) × (r<sub>P</sub> −
          r<sub>B</sub>)
        </div>
        <p>
          Allocation rewards overweighting sectors that beat the overall
          benchmark; selection rewards picking the right names inside a sector;
          interaction is the cross-term, and it is the one most commentaries
          quietly fold into selection. Summed across sectors, the three equal
          total active return exactly — a useful check that the decomposition is
          complete.
        </p>

        <h3>The catch nobody mentions in the pitch book</h3>
        <p>
          These effects are clean for one period. They do <em>not</em> add up
          across periods, because returns compound while attribution effects are
          arithmetic. Take a portfolio that runs the same active return for four
          quarters:
        </p>
        <div className="stats">
          <div className="stat">
            <div className="k">Σ quarterly active</div>
            <div className="v">{pct(carino.naiveSum)}%</div>
          </div>
          <div className="stat">
            <div className="k">Geometric active</div>
            <div className="v">{pct(carino.linkedActive)}%</div>
          </div>
          <div className="stat">
            <div className="k">Compounded port.</div>
            <div className="v">{pct(carino.geometricRp)}%</div>
          </div>
          <div className="stat">
            <div className="k">Compounded bench.</div>
            <div className="v">{pct(carino.geometricRb)}%</div>
          </div>
        </div>
        <div className="callout">
          <strong>Why they differ:</strong> naively adding the four quarterly
          active returns gives {pct(carino.naiveSum)}%, but the actual
          compounded active return is {pct(carino.linkedActive)}%. Linking
          algorithms — Carino, Menchero, GRAP — exist precisely to distribute
          this compounding residual back onto each period's effects so a
          multi-period attribution still reconciles to realised performance.
          Getting this wrong is the most common error in home-grown attribution.
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="control" style={{ marginBottom: 8 }}>
      <div className="row">
        <span className="name">{label}</span>
        <span className="val">
          {value.toFixed(step < 1 ? 1 : 0)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
