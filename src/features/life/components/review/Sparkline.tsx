interface Props {
  points: (number | null)[];
  color?: string;
  height?: number;
  width?: number;
}

/** Minimal hand-built SVG sparkline — no charting library in this project. */
export function Sparkline({ points, color = "#60a5fa", height = 36, width = 140 }: Props) {
  const valid = points.filter((p): p is number => p !== null);
  if (valid.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-caption text-muted shrink-0"
        style={{ height, width }}
      >
        Not enough data
      </div>
    );
  }

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);

  const coords = points.map((p, i) => {
    if (p === null) return null;
    const x = i * stepX;
    const y = height - ((p - min) / range) * height;
    return [x, y] as [number, number];
  });

  let path = "";
  let drawing = false;
  for (const c of coords) {
    if (!c) {
      drawing = false;
      continue;
    }
    path += `${drawing ? "L" : "M"}${c[0].toFixed(1)},${c[1].toFixed(1)} `;
    drawing = true;
  }

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <path
        d={path.trim()}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((c, i) => (c ? <circle key={i} cx={c[0]} cy={c[1]} r={2} fill={color} /> : null))}
    </svg>
  );
}
