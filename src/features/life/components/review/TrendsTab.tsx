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
    <div >
      {TREND_METRICS.map((metric) => {
        const points = weeklyTrend(entries, metric.selector, latestWeekStart, WEEKS_SHOWN);
        const latest = [...points].reverse().find((p) => p.value !== null)?.value ?? null;
        return (
          <div
            key={metric.key}

          >
            <div >
              <span >
                {metric.label}
              </span>
              <span >
                {latest !== null ? `${latest}${metric.unit ?? ""}` : "—"}
              </span>
              <span >Last {WEEKS_SHOWN} weeks</span>
            </div>
            <Sparkline points={points.map((p) => p.value)} />
          </div>
        );
      })}
    </div>
  );
}
