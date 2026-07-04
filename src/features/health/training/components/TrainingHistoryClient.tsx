"use client";

import { useRouter } from "next/navigation";
import { History as HistoryIcon } from "lucide-react";
import type { TrainingSessionSummaryData } from "../types";

interface TrainingHistoryClientProps {
  initialSessions: TrainingSessionSummaryData[];
}

export function TrainingHistoryClient({
  initialSessions,
}: TrainingHistoryClientProps) {
  const router = useRouter();

  if (initialSessions.length === 0) {
    return (
      <div className="bg-surface/30 border border-dashed border-border/40 rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-raised flex items-center justify-center border border-border">
          <HistoryIcon size={32} className="text-muted/40" />
        </div>
        <p className="text-base font-bold text-text">No sessions logged yet</p>
        <p className="text-note text-muted max-w-[280px]">
          Start a session from the Plans tab to begin logging your workouts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {initialSessions.map((s) => (
        <button
          key={s.id}
          onClick={() => router.push(`/health/training/session/${s.id}`)}
          className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface/30 hover:bg-raised transition-colors text-left"
        >
          <div className="flex flex-col">
            <span className="text-note font-bold text-text">{s.dayName}</span>
            <span className="text-caption text-muted">
              {new Date(s.date).toLocaleDateString()} · {s._count.setLogs} sets
            </span>
          </div>
          <span
            className={`text-label font-mono uppercase px-2.5 py-1 rounded-full ${
              s.status === "completed"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-amber-500/10 text-amber-500"
            }`}
          >
            {s.status === "completed" ? "Completed" : "In progress"}
          </span>
        </button>
      ))}
    </div>
  );
}
