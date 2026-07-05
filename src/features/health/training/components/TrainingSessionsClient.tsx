"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { deleteSessionAction } from "../actions/training-session-actions";
import type { TrainingSessionSummaryData } from "../types";

interface TrainingHistoryClientProps {
  initialSessions: TrainingSessionSummaryData[];
}

export function TrainingHistoryClient({ initialSessions }: TrainingHistoryClientProps) {
  const router = useRouter();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    const result = await deleteSessionAction(sessionToDelete);
    if (result.success) toast.success("Session deleted");
    else toast.error(result.error || "Failed to delete session");
    setSessionToDelete(null);
  };

  if (initialSessions.length === 0) {
    return (
      <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-training/10 text-accent-training">
          <HistoryIcon size={32} />
        </div>
        <p className="text-panel-title">No sessions logged yet</p>
        <p className="text-caption max-w-sm">
          Start a session from the Plan tab to begin logging your workouts.
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
          <div
            key={s.id}
            className="glass-card p-3 flex items-center justify-between gap-3 hover:border-white/[0.12] transition-colors"
          >
            <button
              onClick={() => router.push(`/health/training/session/${s.id}`)}
              className="flex flex-col min-w-0 flex-1 text-left"
            >
              <span className="text-sm font-medium text-zinc-100 truncate">{s.dayName}</span>
              <span className="text-caption">
                {new Date(s.date).toLocaleDateString()} · {s._count.setLogs} sets
              </span>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <span className={statusClass}>{isCompleted ? "Completed" : "In progress"}</span>
              <button
                onClick={() => setSessionToDelete(s.id)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}

      <ConfirmationDialog
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete session?"
        description="This will permanently delete the session and all its logged sets."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
