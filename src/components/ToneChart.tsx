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

export interface TonePoint {
  id: string;
  date: string;
  index: number;
}

interface ToneChartProps {
  points: TonePoint[];
  /** id of the statement currently selected, highlighted in gold. */
  selected: string;
  /** Click a bar to jump to that meeting. */
  onSelect: (id: string) => void;
}

/**
 * The tone timeline: one bar per meeting, net tone index on the y-axis
 * (hawkish up, dovish down). The selected meeting is gold; clicking any bar
 * selects it, so the chart doubles as the meeting picker.
 */
export default function ToneChart({ points, selected, onSelect }: ToneChartProps) {
  return (
    <div className="chart-wrap" style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          barCategoryGap={18}
        >
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#4a4d51" }}
            axisLine={{ stroke: "#d2ccbe" }}
            tickLine={false}
          />
          <YAxis
            type="number"
            domain={[-100, 100]}
            ticks={[-100, -50, 0, 50, 100]}
            tick={{ fontSize: 11, fill: "#80848a" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            formatter={(v: number) => [`${v > 0 ? "+" : ""}${v}`, "Tone"]}
            contentStyle={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              border: "1px solid #d2ccbe",
              borderRadius: 2,
            }}
          />
          <ReferenceLine y={0} stroke="#80848a" />
          <Bar
            dataKey="index"
            onClick={(d: { id?: string }) => d.id && onSelect(d.id)}
            style={{ cursor: "pointer" }}
            isAnimationActive={false}
          >
            {points.map((p) => (
              <Cell
                key={p.id}
                fill={
                  p.id === selected
                    ? "#b08433"
                    : p.index >= 0
                      ? "#1f4a5c"
                      : "#2f6b80"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
