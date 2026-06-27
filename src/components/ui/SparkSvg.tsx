/** Ultra-light sparkline drawn with raw SVG — no chart library, no runtime cost. */
export default function SparkSvg({
  data,
  color = "#ffffff",
  height = 48,
  width = 160,
  fill = true,
  strokeWidth = 2,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
  strokeWidth?: number;
}) {
  if (data.length < 2) return <div style={{ height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = strokeWidth;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts.at(-1)![0].toFixed(1)},${height} L${pts[0][0].toFixed(1)},${height} Z`;
  const gid = `spk-${color.replace("#", "")}-${Math.round(width)}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
