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
import { computeAll, SCENARIOS, HedgeResult } from "../lib/hedging";
import { signed, signClass, pct } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import CopyLinkButton from "../components/CopyLinkButton";

interface ToolState {
  sc: string;
}

const DEFAULT_STATE: ToolState = { sc: "flat-fx" };

function buildVerdict(results: HedgeResult[], fxMove: number, carryRate: number): string {
  const [unhedged, , fully] = results;
  const spread = Math.abs(unhedged.total - fully.total).toFixed(1);
  const hedgingWins = fully.total > unhedged.total;
  const winner = hedgingWins ? "fully hedging" : "staying unhedged";
  const loser = hedgingWins ? "unhedged" : "fully hedged";

  if (Math.abs(fxMove) < 0.5) {
    return `With no currency move, the hedge ratio had almost no effect on returns — the only variable was the ${pct(Math.abs(carryRate))}% carry cost of each unit of hedge.`;
  }

  if (fxMove > 0) {
    // CAD fell — unhedged wins
    return `The CAD fell, handing unhedged investors a +${fxMove.toFixed(1)}% FX tailwind. ${winner === "staying unhedged" ? "Staying unhedged" : "Fully hedging"} returned ${pct(hedgingWins ? fully.total : unhedged.total)}% vs ${pct(hedgingWins ? unhedged.total : fully.total)}% ${loser} — a ${spread}% spread driven almost entirely by the FX move.`;
  }

  if (fxMove < 0) {
    // CAD rose — hedging wins
    return `The CAD rose, turning FX into a ${signed(fxMove, 1)}% drag for unhedged investors. Fully hedged sidestepped it and returned ${pct(fully.total)}% vs ${pct(unhedged.total)}% unhedged — a ${spread}% gap, minus only the ${pct(Math.abs(carryRate))}% carry cost.`;
  }

  return `${winner} outperformed by ${spread}%.`;
}

export default function CurrencyHedging() {
  const [state, setState] = useSharedState<ToolState>(DEFAULT_STATE);

  const scenario = SCENARIOS.find((s) => s.id === state.sc) ?? SCENARIOS[0];
  const results = useMemo(() => computeAll(scenario), [scenario]);

  const [unhedged, half, fully] = results;

  const chartData = results.map((r) => ({
    name: r.level.short + " hedged",
    value: r.total,
  }));

  const verdict = buildVerdict(results, scenario.fxMove, scenario.carryRate);

  return (
    <ToolPage
      slug="currency-hedging"
      actions={<CopyLinkButton />}
      lede={
        <>
          A Canadian investor's global book has three return layers: the local
          equity return, the currency move (USD/CAD), and the carry embedded in
          the forward contract used to hedge. Pick a regime below and watch all
          three shift as the hedge ratio changes — and see which bet the FX
          environment actually rewarded.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Regime</span>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`preset${state.sc === s.id ? " active" : ""}`}
              title={s.blurb}
              onClick={() => setState({ sc: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Unhedged</div>
          <div className={`v ${signClass(unhedged.total)}`}>
            {pct(unhedged.total)}%
          </div>
        </div>
        <div className="stat">
          <div className="k">Half-Hedged</div>
          <div className={`v ${signClass(half.total)}`}>{pct(half.total)}%</div>
        </div>
        <div className="stat">
          <div className="k">Fully Hedged</div>
          <div className={`v ${signClass(fully.total)}`}>
            {pct(fully.total)}%
          </div>
        </div>
      </div>

      <div className="verdict">{verdict}</div>

      <div
        className="output"
        style={{ border: "1px solid var(--rule)", marginTop: 0 }}
      >
        <h4>Total return by hedge ratio</h4>
        <div className="chart-wrap" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 4, bottom: 0 }}
              barCategoryGap={32}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#4a4d51" }}
                axisLine={{ stroke: "#d2ccbe" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#80848a" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              />
              <Tooltip
                formatter={(v: number) => [`${signed(v, 1)}%`, "Total Return"]}
                contentStyle={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  border: "1px solid #d2ccbe",
                  borderRadius: 2,
                }}
              />
              <ReferenceLine y={0} stroke="#80848a" />
              <Bar dataKey="value" isAnimationActive={false} maxBarSize={72}>
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
              <th>Component</th>
              <th className="num">Unhedged (0%)</th>
              <th className="num">Half-Hedged (50%)</th>
              <th className="num">Fully Hedged (100%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Local equity return</td>
              {results.map((r) => (
                <td key={r.level.id} className={`num ${signClass(r.local)}`}>
                  {signed(r.local, 1)}%
                </td>
              ))}
            </tr>
            <tr>
              <td>FX effect</td>
              {results.map((r) => (
                <td key={r.level.id} className={`num ${signClass(r.fxEffect)}`}>
                  {r.fxEffect === 0 ? "—" : `${signed(r.fxEffect, 1)}%`}
                </td>
              ))}
            </tr>
            <tr>
              <td>Carry</td>
              {results.map((r) => (
                <td key={r.level.id} className={`num ${signClass(r.carry)}`}>
                  {r.carry === 0 ? "—" : `${signed(r.carry, 2)}%`}
                </td>
              ))}
            </tr>
            <tr className="total">
              <td>
                <strong>Total return</strong>
              </td>
              {results.map((r) => (
                <td key={r.level.id} className={`num ${signClass(r.total)}`}>
                  <strong>{signed(r.total, 1)}%</strong>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="prose">
        <h3>How the three layers add up</h3>
        <p>
          The total return for a Canadian investor holding a foreign equity book
          at hedge ratio <em>h</em> is:
        </p>
        <div className="formula">
          total = r<sub>local</sub> + (1 − h) × r<sub>FX</sub> + h × carry
          <br />
          carry ≈ r<sub>CAD</sub> − r<sub>foreign</sub>
        </div>
        <p>
          The FX effect scales linearly with the unhedged fraction — going from
          0% to 100% hedged replaces all of it with the carry rate. Carry is
          priced by covered-interest parity: if US short rates exceed Canadian
          rates, the USD forward trades at a discount to spot, so selling it
          forward (hedging) means locking in a rate below today's spot. That
          discount is the carry cost.
        </p>
        <h3>Why the right answer depends on the regime</h3>
        <p>
          No hedge ratio dominates across environments. When the CAD is falling —
          as it did in 2015 when oil collapsed — the FX move is a tailwind and
          hedging locks it out while still costing carry. When the CAD rises, the
          unhedged position absorbs a drag that a forward would have eliminated at
          the cost of a much smaller carry premium. In 2022 the Federal Reserve
          hiked far faster than the Bank of Canada, widening the carry cost to
          roughly 4% — so even though equities fell and the USD was relatively
          strong, fully hedging would have added a punishing carry drag on top of
          the equity loss. The regime determines which of the two risks — FX
          variance or carry cost — is the larger of the two.
        </p>
        <p>
          The other portfolio construction tools:{" "}
          <Link to="/efficient-frontier">Resampled Efficient Frontier</Link> on
          estimation error and optimizer instability, and{" "}
          <Link to="/black-litterman">Black-Litterman View Mixer</Link> on
          blending views into weights.
        </p>
      </div>
    </ToolPage>
  );
}
