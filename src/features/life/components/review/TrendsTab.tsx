import {
  weeklyTrend,
  morningRoutinePct,
  eveningRoutinePct,
} from "@/features/life/logic/review-analytics";
import type { ReviewEntryData } from "@/features/life/types";
import { Sparkline } from "./Sparkline";

interface Props {
  entries: ReviewEntryData[];
  latestWeekStart: Date;
}

const WEEKS_SHOWN = 8;

const TREND_METRICS: {
  key: string;
  label: string;
  unit?: string;
  selector: (e: ReviewEntryData) => number | null;
}[] = [
  { key: "mood", label: "Mood", unit: "/10", selector: (e) => e.mood },
  { key: "energy", label: "Energy", unit: "/10", selector: (e) => e.energy },
  { key: "sleepHours", label: "Sleep", unit: "h", selector: (e) => e.sleepHours },
  { key: "sleepQuality", label: "Sleep quality", unit: "/10", selector: (e) => e.sleepQuality },
  { key: "morningRoutine", label: "Morning routine", unit: "%", selector: morningRoutinePct },
  { key: "eveningRoutine", label: "Evening routine", unit: "%", selector: eveningRoutinePct },
];

export function TrendsTab({ entries, latestWeekStart }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TREND_METRICS.map((metric) => {
        const points = weeklyTrend(entries, metric.selector, latestWeekStart, WEEKS_SHOWN);
        const latest = [...points].reverse().find((p) => p.value !== null)?.value ?? null;
        return (
          <div
            key={metric.key}
            className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-caption font-mono uppercase tracking-wider text-muted">
                {metric.label}
              </span>
              <span className="text-heading font-bold text-text">
                {latest !== null ? `${latest}${metric.unit ?? ""}` : "—"}
              </span>
              <span className="text-caption text-muted">Last {WEEKS_SHOWN} weeks</span>
            </div>
            <Sparkline points={points.map((p) => p.value)} />
          </div>
        );
      })}
    </div>
  );
}
