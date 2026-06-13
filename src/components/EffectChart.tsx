import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AttributionResult } from "../lib/attribution";
import { SHORT_NAME } from "../lib/scenarios";

interface EffectChartProps {
  result: AttributionResult;
  /** When folded, interaction is rolled into selection and its series hidden. */
  foldInteraction: boolean;
}

/**
 * Horizontal stacked bars — one row per GICS sector — so the eleven long
 * sector names stay readable while allocation / selection / interaction stack
 * into each sector's total contribution to active return.
 */
export default function EffectChart({ result, foldInteraction }: EffectChartProps) {
  const data = result.effects.map((e) => ({
    name: SHORT_NAME[e.name] ?? e.name,
    Allocation: e.allocation,
    Selection: e.selection,
    Interaction: e.interaction,
  }));

  return (
    <div className="chart-wrap" style={{ height: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
          barCategoryGap={4}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#80848a" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#4a4d51" }}
            axisLine={{ stroke: "#d2ccbe" }}
            tickLine={false}
            width={96}
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
          <ReferenceLine x={0} stroke="#80848a" />
          <Bar dataKey="Allocation" stackId="a" fill="#1f4a5c" />
          <Bar dataKey="Selection" stackId="a" fill="#2f6b80" />
          {!foldInteraction && (
            <Bar dataKey="Interaction" stackId="a" fill="#b08433" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
