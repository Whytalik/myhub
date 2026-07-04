"use client";

import { useRouter } from "next/navigation";
import { History as HistoryIcon } from "lucide-react";
import type { TrainingSessionSummaryData } from "../types";

interface TrainingHistoryClientProps {
  initialSessions: TrainingSessionSummaryData[];
}

export function TrainingHistoryClient({ initialSessions }: TrainingHistoryClientProps) {
  const router = useRouter();

  if (initialSessions.length === 0) {
    return (
      <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-training/10 text-accent-training">
          <HistoryIcon size={32} />
        </div>
        <p className="text-panel-title">No sessions logged yet</p>
        <p className="text-caption max-w-sm">
          Start a session from the Plans tab to begin logging your workouts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {initialSessions.map((s) => {
        const isCompleted = s.status === "completed";
        const statusClass = `text-[10px] font-mono font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
          isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
        }`;

        return (
          <button
            key={s.id}
            onClick={() => router.push(`/health/training/session/${s.id}`)}
            className="glass-card p-3 flex items-center justify-between gap-3 hover:border-white/[0.12] transition-colors text-left"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-zinc-100 truncate">{s.dayName}</span>
              <span className="text-caption">
                {new Date(s.date).toLocaleDateString()} · {s._count.setLogs} sets
              </span>
            </div>
            <span className={statusClass}>{isCompleted ? "Completed" : "In progress"}</span>
          </button>
        );
      })}
    </div>
  );
}
