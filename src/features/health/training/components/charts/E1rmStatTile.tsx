import { TRAINING_ACCENT, CHART_MUTED_LINE } from "./chart-tokens";

interface E1rmStatTileProps {
  exerciseName: string;
  points: { date: Date; e1rm: number }[];
}

const WIDTH = 160;
const HEIGHT = 44;
const PAD_X = 6;
const PAD_Y = 6;

export function E1rmStatTile({ exerciseName, points }: E1rmStatTileProps) {
  const values = points.map((p) => p.e1rm);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const plotW = WIDTH - PAD_X * 2;
  const plotH = HEIGHT - PAD_Y * 2;
  const step = points.length > 1 ? plotW / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: PAD_X + i * step,
    y: PAD_Y + plotH * (1 - (p.e1rm - min) / range),
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const delta = last.e1rm - prev.e1rm;
  const deltaClass = delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-zinc-500";
  const deltaLabel = delta === 0 ? "0" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;
  const lastCoord = coords[coords.length - 1];

  return (
    <div className="glass-card p-3.5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-zinc-300 truncate">{exerciseName}</span>
        <span className={`text-[10px] font-mono font-semibold shrink-0 ${deltaClass}`}>
          {deltaLabel} кг
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-lg font-semibold text-zinc-100 font-mono">
          {last.e1rm.toFixed(1)}
        </span>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="shrink-0">
          <path
            d={linePath}
            fill="none"
            stroke={CHART_MUTED_LINE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={lastCoord.x}
            cy={lastCoord.y}
            r={4}
            fill={TRAINING_ACCENT}
            stroke="#1c1c1e"
            strokeWidth={2}
          />
        </svg>
      </div>
      <span className="text-[10px] text-zinc-500 font-mono">оцінка 1ПМ (Epley)</span>
    </div>
  );
}
