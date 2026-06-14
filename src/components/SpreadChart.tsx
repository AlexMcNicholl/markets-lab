import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CreditResult } from "../lib/credit";

// Segment colours, reused by the page's reconciling table so the bar and the
// rows read as one object. Same ink/teal/gold palette as the other tools.
export const SPREAD_COLORS = {
  riskFree: "#b9b3a5",
  el: "#1f4a5c",
  rp: "#2f6b80",
  liq: "#b08433",
} as const;

interface SpreadChartProps {
  result: CreditResult;
  /** When true the risk-free base is stacked in, so the bar is the whole yield. */
  showRiskFree: boolean;
}

/**
 * A single horizontal stacked bar: the yield build-up. Reading left to right it
 * stacks the risk-free base (optional) and the three credit-spread slices into
 * one total, so the relative size of each "thing you're paid for" is visible at
 * a glance. All segments are in basis points.
 */
export default function SpreadChart({ result, showRiskFree }: SpreadChartProps) {
  const c = (k: CreditResult["components"][number]["key"]) =>
    result.components.find((x) => x.key === k)?.bps ?? 0;

  const data = [
    {
      name: showRiskFree ? "Yield" : "Spread",
      "Risk-free": showRiskFree ? result.riskFree * 100 : 0,
      "Expected loss": c("el"),
      "Credit risk premium": c("rp"),
      "Liquidity premium": c("liq"),
    },
  ];

  return (
    <div className="chart-wrap" style={{ height: 132 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 16, left: 4, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#80848a" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v} bps`}
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
            formatter={(v: number) => `${Math.round(v)} bps`}
            contentStyle={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              border: "1px solid #d2ccbe",
              borderRadius: 2,
            }}
          />
          {showRiskFree && (
            <Bar dataKey="Risk-free" stackId="a" fill={SPREAD_COLORS.riskFree} maxBarSize={56} />
          )}
          <Bar dataKey="Expected loss" stackId="a" fill={SPREAD_COLORS.el} maxBarSize={56} />
          <Bar dataKey="Credit risk premium" stackId="a" fill={SPREAD_COLORS.rp} maxBarSize={56} />
          <Bar dataKey="Liquidity premium" stackId="a" fill={SPREAD_COLORS.liq} maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
