import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const tooltipStyle = {
  background: "#161619",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  fontSize: 12,
  color: "#fff",
  padding: "8px 10px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
};

export function AreaSpark({
  data,
  color = "#ffffff",
  height = 60,
  dataKey = "v",
}: {
  data: { v: number; label?: string }[];
  color?: string;
  height?: number;
  dataKey?: string;
}) {
  const id = `area-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${id})`}
          isAnimationActive
          animationDuration={1200}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AreaFull({
  data,
  color = "#5ad1c8",
  height = 220,
  unit = "",
}: {
  data: { label: string; v: number }[];
  color?: string;
  height?: number;
  unit?: string;
}) {
  const id = `areaf-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 6, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#6c6c73", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "#6c6c73", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "rgba(255,255,255,0.12)" }}
          formatter={(v: number) => [`${Math.round(v).toLocaleString("fr-FR")}${unit}`, ""]}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2.4}
          fill={`url(#${id})`}
          isAnimationActive
          animationDuration={1100}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#000", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Bars({
  data,
  color = "#ffffff",
  height = 200,
  unit = "",
}: {
  data: { label: string; v: number }[];
  color?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 6, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#6c6c73", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6c6c73", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(v: number) => [`${Math.round(v).toLocaleString("fr-FR")}${unit}`, ""]}
        />
        <Bar
          dataKey="v"
          fill={color}
          radius={[6, 6, 0, 0]}
          isAnimationActive
          animationDuration={900}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineMini({
  data,
  color = "#39b6ff",
  height = 200,
  unit = "",
}: {
  data: { label: string; v: number }[];
  color?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 6, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#6c6c73", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "#6c6c73", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={["dataMin - 1", "dataMax + 1"]}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "rgba(255,255,255,0.12)" }}
          formatter={(v: number) => [`${v}${unit}`, ""]}
        />
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2.4}
          dot={false}
          isAnimationActive
          animationDuration={1100}
          activeDot={{ r: 4, fill: color, stroke: "#000", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
