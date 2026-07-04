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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {TREND_METRICS.map((metric) => {
        const points = weeklyTrend(entries, metric.selector, latestWeekStart, WEEKS_SHOWN);
        const latest = [...points].reverse().find((p) => p.value !== null)?.value ?? null;
        const latestLabel = latest !== null ? `${latest}${metric.unit ?? ""}` : "—";

        return (
          <div key={metric.key} className="glass-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-panel-title">{metric.label}</span>
              <span className="font-mono text-sm font-semibold text-zinc-100">{latestLabel}</span>
            </div>
            <span className="text-caption">Last {WEEKS_SHOWN} weeks</span>
            <Sparkline points={points.map((p) => p.value)} />
          </div>
        );
      })}
    </div>
  );
}
