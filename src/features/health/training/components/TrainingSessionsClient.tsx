"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { History as HistoryIcon, Trash2, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { EmptyState } from "@/components/ui/display/empty-state";
import { deleteSessionAction, getWeeklyReportAction } from "../actions/training-session-actions";
import type { TrainingSessionSummaryData } from "../types";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";

interface TrainingHistoryClientProps {
  initialSessions: TrainingSessionSummaryData[];
}

export function TrainingHistoryClient({ initialSessions }: TrainingHistoryClientProps) {
  const router = useRouter();
  const sessionToDelete = useConfirmDialog<string>();
  const [isCopyingReport, startCopyReportTransition] = useTransition();
  const { run: runDelete } = useServerAction();

  const confirmDelete = () => {
    if (!sessionToDelete.target) return;
    runDelete(deleteSessionAction(sessionToDelete.target), {
      successMessage: "Session deleted",
      errorMessage: "Failed to delete session",
      onSuccess: sessionToDelete.close,
      onError: sessionToDelete.close,
    });
  };

  const handleCopyWeeklyReport = () => {
    startCopyReportTransition(async () => {
      const result = await getWeeklyReportAction();
      if (!result.success) {
        toast.error(result.error || "Не вдалося сформувати звіт");
        return;
      }
      try {
        await navigator.clipboard.writeText(result.data);
        toast.success("Тижневий звіт скопійовано");
      } catch {
        toast.error("Не вдалося скопіювати звіт");
      }
    });
  };

  if (initialSessions.length === 0) {
    return (
      <EmptyState
        icon={HistoryIcon}
        accentClassName="bg-accent-training/10 text-accent-training"
        title="No sessions logged yet"
        description="Start a session from the Plan tab to begin logging your workouts."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          disabled={isCopyingReport}
          onClick={handleCopyWeeklyReport}
        >
          <ClipboardCopy size={14} />
          {isCopyingReport ? "Формування звіту..." : "Копіювати тижневий звіт"}
        </Button>
      </div>
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
                onClick={() => sessionToDelete.open(s.id)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}

      <ConfirmationDialog
        isOpen={sessionToDelete.isOpen}
        onClose={sessionToDelete.close}
        onConfirm={confirmDelete}
        title="Delete session?"
        description="This will permanently delete the session and all its logged sets."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
