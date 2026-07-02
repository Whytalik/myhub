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
    return <span className="text-caption font-mono text-muted">—</span>;
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
    <span className={`flex items-center gap-1 text-caption font-mono ${color}`}>
      <Icon size={12} />
      {sign}
      {comparison.delta}
      {comparison.unit ?? ""}
    </span>
  );
}

export function SummaryTab({ summary, comparisons }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {comparisons.map((c) => {
          const Icon = ICONS[c.key] ?? CheckCircle2;
          return (
            <div
              key={c.key}
              className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 text-muted">
                <Icon size={14} className="text-accent/60" />
                <span className="text-caption font-mono uppercase tracking-wider">{c.label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-title font-bold text-text">
                  {c.current !== null ? `${c.current}${c.unit ?? ""}` : "—"}
                </span>
                <DeltaBadge comparison={c} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
          <span className="text-caption font-mono uppercase tracking-wider text-muted">
            Days logged
          </span>
          <span className="text-heading font-bold text-text">{summary.daysLogged}/7</span>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
          <span className="text-caption font-mono uppercase tracking-wider text-muted">
            Tasks completed
          </span>
          <span className="text-heading font-bold text-text">{summary.tasksCompleted}</span>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
          <span className="text-caption font-mono uppercase tracking-wider text-muted">
            Frogs done
          </span>
          <span className="text-heading font-bold text-text">{summary.frogsCompleted}</span>
        </div>
      </div>

      {summary.wins.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-caption font-mono uppercase tracking-wider text-muted flex items-center gap-2">
            <ListChecks size={14} className="text-accent/60" /> Wins this week
          </span>
          <div className="flex flex-col gap-2">
            {summary.wins.map((win, i) => (
              <p
                key={i}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-body text-secondary italic"
              >
                &ldquo;{win}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      {summary.daysLogged === 0 && (
        <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted text-body italic">
          No entries logged for this week yet.
        </div>
      )}
    </div>
  );
}
