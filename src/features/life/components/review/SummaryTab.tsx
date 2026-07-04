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
    return <span className="text-caption">—</span>;
  }
  const Icon =
    comparison.direction === "up"
      ? TrendingUp
      : comparison.direction === "down"
        ? TrendingDown
        : Minus;
  const color =
    comparison.direction === "flat" || comparison.direction === "unknown"
      ? "text-zinc-500"
      : comparison.direction === "up"
        ? "text-emerald-400"
        : "text-rose-400";
  const sign = comparison.delta > 0 ? "+" : "";
  const badgeClass = `inline-flex items-center gap-1 text-xs font-mono ${color}`;

  return (
    <span className={badgeClass}>
      <Icon size={12} />
      {sign}
      {comparison.delta}
      {comparison.unit ?? ""}
    </span>
  );
}

export function SummaryTab({ summary, comparisons }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {comparisons.map((c) => {
          const Icon = ICONS[c.key] ?? CheckCircle2;
          const valueLabel = c.current !== null ? `${c.current}${c.unit ?? ""}` : "—";

          return (
            <div key={c.key} className="glass-card p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Icon size={14} />
                <span className="text-label">{c.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-semibold text-zinc-100">{valueLabel}</span>
                <DeltaBadge comparison={c} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-label">Days logged</span>
          <span className="font-mono text-lg font-semibold text-zinc-100">
            {summary.daysLogged}/7
          </span>
        </div>
        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-label">Tasks completed</span>
          <span className="font-mono text-lg font-semibold text-zinc-100">
            {summary.tasksCompleted}
          </span>
        </div>
        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-label">Frogs done</span>
          <span className="font-mono text-lg font-semibold text-zinc-100">
            {summary.frogsCompleted}
          </span>
        </div>
      </div>

      {summary.wins.length > 0 && (
        <div className="glass-card p-4 flex flex-col gap-2">
          <span className="text-panel-title flex items-center gap-2">
            <ListChecks size={14} /> Wins this week
          </span>
          <div className="flex flex-col gap-1.5">
            {summary.wins.map((win, i) => (
              <p key={i} className="text-sm text-zinc-300 italic">
                &ldquo;{win}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      {summary.daysLogged === 0 && (
        <div className="glass-card p-6 flex items-center justify-center">
          <p className="text-caption">No entries logged for this week yet.</p>
        </div>
      )}
    </div>
  );
}
