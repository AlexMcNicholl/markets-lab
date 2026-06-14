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
import { CompResult } from "../lib/comps";

// Same ink/teal/gold palette as the other tools. The anchor peers — the ones
// setting the comp-set statistic — are picked out in gold, matching the dashed
// reference line that marks the price we actually apply.
export const COMP_COLORS = {
  bar: "#2f6b80",
  anchor: "#b08433",
  line: "#1f4a5c",
} as const;

/**
 * Horizontal bars — one per peer — of the share price the target would carry if
 * the whole set looked like that single name. The dashed line is the comp-set
 * statistic (median or mean) we actually apply, so the spread of the bars around
 * it shows how much the answer depends on which names are in the room.
 */
export default function CompChart({ result }: { result: CompResult }) {
  const data = result.rows.map((r) => ({
    name: r.peer.short,
    price: r.impliedPrice,
    anchor: r.isAnchor,
  }));

  return (
    <div className="chart-wrap" style={{ height: 40 + data.length * 34 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
          barCategoryGap={5}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#80848a" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#4a4d51" }}
            axisLine={{ stroke: "#d2ccbe" }}
            tickLine={false}
            width={84}
          />
          <Tooltip
            formatter={(v: number) => `$${v.toFixed(2)}`}
            contentStyle={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              border: "1px solid #d2ccbe",
              borderRadius: 2,
            }}
          />
          <ReferenceLine
            x={result.impliedPrice}
            stroke={COMP_COLORS.line}
            strokeDasharray="4 3"
          />
          <Bar dataKey="price" maxBarSize={26}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.anchor ? COMP_COLORS.anchor : COMP_COLORS.bar} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
