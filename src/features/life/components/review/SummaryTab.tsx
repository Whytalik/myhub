import {
  Moon,
  Zap,
  Smile,
  Utensils,
  CheckCircle2,
  Sun,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  ListChecks,
} from "lucide-react";
import type { WeekSummary, MetricComparison } from "@/features/life/types";

interface Props {
  summary: WeekSummary;
  comparisons: MetricComparison[];
}

const ICONS: Record<string, typeof Moon> = {
  avgMood: Smile,
  avgEnergy: Zap,
  avgSleepHours: Moon,
  avgSleepQuality: Moon,
  morningRoutinePct: Sun,
  eveningRoutinePct: CheckCircle2,
  nutritionAdherencePct: Utensils,
  habitsAdherencePct: Flame,
};

function DeltaBadge({ comparison }: { comparison: MetricComparison }) {
  if (comparison.delta === null) {
    return <span >—</span>;
  }
  const Icon =
    comparison.direction === "up"
      ? TrendingUp
      : comparison.direction === "down"
        ? TrendingDown
        : Minus;
  const color =
    comparison.direction === "flat" || comparison.direction === "unknown"
      ? "text-muted"
      : comparison.direction === "up"
        ? "text-emerald-500"
        : "text-rose-500";
  const sign = comparison.delta > 0 ? "+" : "";
  return (
    <span >
      <Icon size={12} />
      {sign}
      {comparison.delta}
      {comparison.unit ?? ""}
    </span>
  );
}

export function SummaryTab({ summary, comparisons }: Props) {
  return (
    <div >
      <div >
        {comparisons.map((c) => {
          const Icon = ICONS[c.key] ?? CheckCircle2;
          return (
            <div
              key={c.key}

            >
              <div >
                <Icon size={14} />
                <span >{c.label}</span>
              </div>
              <div >
                <span >
                  {c.current !== null ? `${c.current}${c.unit ?? ""}` : "—"}
                </span>
                <DeltaBadge comparison={c} />
              </div>
            </div>
          );
        })}
      </div>

      <div >
        <div >
          <span >
            Days logged
          </span>
          <span >{summary.daysLogged}/7</span>
        </div>
        <div >
          <span >
            Tasks completed
          </span>
          <span >{summary.tasksCompleted}</span>
        </div>
        <div >
          <span >
            Frogs done
          </span>
          <span >{summary.frogsCompleted}</span>
        </div>
      </div>

      {summary.wins.length > 0 && (
        <div >
          <span >
            <ListChecks size={14} /> Wins this week
          </span>
          <div >
            {summary.wins.map((win, i) => (
              <p
                key={i}

              >
                &ldquo;{win}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      {summary.daysLogged === 0 && (
        <div >
          No entries logged for this week yet.
        </div>
      )}
    </div>
  );
}
