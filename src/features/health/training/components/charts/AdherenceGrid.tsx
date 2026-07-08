import { TRAINING_SEQUENTIAL_RAMP } from "./chart-tokens";
import type { WeekBucket } from "../../utils/stats";

interface AdherenceGridProps {
  weeks: WeekBucket[];
}

function colorForCount(count: number): string {
  if (count <= 0) return "transparent";
  if (count === 1) return TRAINING_SEQUENTIAL_RAMP[0];
  if (count === 2) return TRAINING_SEQUENTIAL_RAMP[1];
  if (count === 3) return TRAINING_SEQUENTIAL_RAMP[2];
  return TRAINING_SEQUENTIAL_RAMP[3];
}

function formatRange(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
  return `${fmt(start)}–${fmt(end)}`;
}

export function AdherenceGrid({ weeks }: AdherenceGridProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {weeks.map((week) => {
        const bg = colorForCount(week.sessionsCount);
        return (
          <div key={week.weekStart.toISOString()} className="relative group">
            <div
              tabIndex={0}
              className="w-7 h-7 rounded-md border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-accent-training/40 transition-transform group-hover:scale-105"
              style={{ backgroundColor: bg }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-black/90 border border-white/10 px-2 py-1 text-[10px] font-mono text-zinc-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
              {formatRange(week.weekStart, week.weekEnd)} — {week.sessionsCount}{" "}
              {week.sessionsCount === 1 ? "тренування" : "тренувань"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
