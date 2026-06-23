import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { FACTORS, FACTOR_COLOR, WindowPoint } from "../lib/factor";

/**
 * Rolling factor betas - one line per factor, re-estimated on each trailing
 * window. A flat line is a stable exposure; a sloping or sign-flipping line is
 * style drift the full-period average quietly hides. The dashed β = 1 guide
 * anchors the market-beta line against a full index exposure.
 */
export default function FactorBetaChart({ windows }: { windows: WindowPoint[] }) {
  const data = windows.map((w) => ({
    name: w.label,
    ...Object.fromEntries(FACTORS.map((f) => [f, w.beta[f]])),
  }));

  return (
    <div className="chart-wrap" style={{ height: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="name"
            interval={4}
            tick={{ fontSize: 11, fill: "#4a4d51" }}
            axisLine={{ stroke: "#d2ccbe" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#80848a" }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <Tooltip
            formatter={(v: number) => v.toFixed(2)}
            contentStyle={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              border: "1px solid #d2ccbe",
              borderRadius: 2,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <ReferenceLine y={0} stroke="#80848a" />
          <ReferenceLine
            y={1}
            stroke="#b8b2a4"
            strokeDasharray="4 4"
            label={{ value: "β = 1", position: "right", fontSize: 10, fill: "#80848a" }}
          />
          {FACTORS.map((f) => (
            <Line
              key={f}
              type="monotone"
              dataKey={f}
              name={f}
              stroke={FACTOR_COLOR[f]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
