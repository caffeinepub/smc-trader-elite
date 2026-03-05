import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Trade } from "../backend.d";

interface Props {
  trades: Trade[];
  height?: number;
}

interface DataPoint {
  index: number;
  cumulative: number;
  rr: number;
  pair: string;
  result: string;
}

// Custom Tooltip
const CustomTooltip = ({
  active,
  payload,
}: { active?: boolean; payload?: Array<{ payload: DataPoint }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-xs font-body border border-border/60 shadow-card">
      <div className="font-mono font-semibold text-foreground">
        #{d.index} — {d.pair}
      </div>
      <div className={`font-mono mt-1 ${d.rr >= 0 ? "text-win" : "text-loss"}`}>
        {d.rr >= 0 ? "+" : ""}
        {d.rr.toFixed(2)}R this trade
      </div>
      <div className="text-muted-foreground mt-0.5">
        Cumulative:{" "}
        <span className={d.cumulative >= 0 ? "text-win" : "text-loss"}>
          {d.cumulative.toFixed(2)}R
        </span>
      </div>
    </div>
  );
};

export default function EquityCurveChart({ trades, height = 200 }: Props) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const data: DataPoint[] = [];
  let cumulative = 0;
  sorted.forEach((trade, i) => {
    cumulative += trade.rrAchieved;
    data.push({
      index: i + 1,
      cumulative: Number.parseFloat(cumulative.toFixed(2)),
      rr: trade.rrAchieved,
      pair: trade.pair,
      result: trade.result,
    });
  });

  const isPositive = data.length > 0 && data[data.length - 1].cumulative >= 0;
  const lineColor = isPositive ? "oklch(0.74 0.2 145)" : "oklch(0.62 0.22 22)";
  const gradientId = isPositive ? "equityGreen" : "equityRed";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={lineColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.22 0.015 255 / 0.4)"
          vertical={false}
        />
        <XAxis
          dataKey="index"
          tick={{
            fontSize: 10,
            fill: "oklch(0.52 0.018 240)",
            fontFamily: "Geist Mono",
          }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Trade #",
            position: "insideBottom",
            offset: -2,
            fontSize: 10,
            fill: "oklch(0.52 0.018 240)",
          }}
        />
        <YAxis
          tick={{
            fontSize: 10,
            fill: "oklch(0.52 0.018 240)",
            fontFamily: "Geist Mono",
          }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}R`}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: "4 2" }}
        />
        <ReferenceLine
          y={0}
          stroke="oklch(0.52 0.018 240 / 0.5)"
          strokeDasharray="4 2"
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke={lineColor}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{
            r: 4,
            fill: lineColor,
            stroke: "oklch(0.1 0.008 255)",
            strokeWidth: 2,
          }}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
