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
import { LinkResult } from "../lib/linking";

/**
 * Cumulative active return, two ways: the naive running sum of each period's
 * arithmetic active return vs. the compounded (true) active return. The two
 * lines start together and drift apart over the year — the end-of-year gap is
 * the linking residual the table then distributes back.
 */
export default function LinkingChart({ result }: { result: LinkResult }) {
  const data = [
    { name: "Start", Naive: 0, Compounded: 0 },
    ...result.periods.map((p) => ({
      name: p.label,
      Naive: p.cumNaive,
      Compounded: p.cumTrue,
    })),
  ];

  return (
    <div className="chart-wrap" style={{ height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
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
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <ReferenceLine y={0} stroke="#80848a" />
          <Line
            type="monotone"
            dataKey="Naive"
            name="Sum of quarters (naive)"
            stroke="#b08433"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3, fill: "#b08433" }}
          />
          <Line
            type="monotone"
            dataKey="Compounded"
            name="Compounded (true) active"
            stroke="#1f4a5c"
            strokeWidth={2}
            dot={{ r: 3, fill: "#1f4a5c" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
