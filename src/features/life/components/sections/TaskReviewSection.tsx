"use client";

import { useState, useTransition, useMemo } from "react";
import { RefreshCw, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import type { TaskData } from "@/features/life/types";
import { carryOverTaskAction } from "@/features/life/actions/task-actions";

interface Props {
  tasks: TaskData[];
  date: string; // "YYYY-MM-DD"
}

const PRESETS = [
  "Не вистачило часу",
  "Заблоковано",
  "Змінив пріоритет",
  "Відклав",
  "Без причини",
] as const;

export function TaskReviewSection({ tasks, date }: Props) {
  const [carriedTaskIds, setCarriedTaskIds] = useState<string[]>([]);
  const [dismissedTaskIds, setDismissedTaskIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tomorrowISO = useMemo(() => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, [date]);

  const doneTasks = tasks.filter((t) => t.status === "DONE");
  const done = doneTasks.length;
  const visible = tasks.filter(
    (t) => !carriedTaskIds.includes(t.id) && !dismissedTaskIds.includes(t.id)
  );
  const incompleteTasks = visible.filter(
    (t) => t.status !== "DONE" && t.status !== "CANCELLED"
  );
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleOpenReason = (taskId: string) => {
    setExpandedId((prev) => (prev === taskId ? null : taskId));
    setSelectedPreset(null);
    setCustomReason("");
  };

  const handleConfirm = (taskId: string) => {
    const reason = selectedPreset ?? (customReason.trim() || null);
    startTransition(async () => {
      const result = await carryOverTaskAction(taskId, reason, tomorrowISO);
      if (result.success) {
        setCarriedTaskIds((p) => [...p, taskId]);
        setExpandedId(null);
        setSelectedPreset(null);
        setCustomReason("");
        toast.success("Завдання перенесено на завтра");
      } else {
        toast.error(result.error ?? "Помилка при переносі");
      }
    });
  };

  const handleDismiss = (taskId: string) => {
    setDismissedTaskIds((p) => [...p, taskId]);
    if (expandedId === taskId) setExpandedId(null);
  };

  if (total === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-note font-mono text-muted uppercase tracking-[0.3em]">Task Review</span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      {/* Stats bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-muted tabular-nums shrink-0">
            {done} / {total} виконано
          </span>
        </div>
        {carriedTaskIds.length > 0 && (
          <div className="flex items-center gap-1.5">
            <RefreshCw size={10} className="text-accent/50" />
            <span className="text-note text-accent/60 font-mono">
              {carriedTaskIds.length} перенесено на завтра
            </span>
          </div>
        )}
      </div>

      {/* Done tasks (collapsible) */}
      {doneTasks.length > 0 && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="flex items-center gap-2 text-note text-muted/60 hover:text-muted transition-colors w-fit"
          >
            {showDone ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span className="font-mono uppercase tracking-wider">
              Виконано ({doneTasks.length})
            </span>
          </button>
          {showDone && (
            <div className="flex flex-col gap-1 mt-1">
              {doneTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5 py-1 opacity-50">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Check size={9} className="text-emerald-400" />
                  </div>
                  {task.sphere && (
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: task.sphere.color }}
                    />
                  )}
                  <span className="text-body text-muted line-through truncate">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incomplete tasks */}
      {incompleteTasks.length > 0 ? (
        <div className="flex flex-col gap-2">
          {incompleteTasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-0">
              <div className="flex items-center gap-2.5 py-1.5 group">
                <div className="w-4 h-4 rounded-full border border-border/60 shrink-0" />
                {task.sphere && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.sphere.color }}
                  />
                )}
                <span className="text-body text-text truncate flex-1">{task.title}</span>
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenReason(task.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-note font-mono text-accent/70 hover:text-accent hover:bg-accent/10 transition-all border border-accent/20 hover:border-accent/40"
                  >
                    <RefreshCw size={10} />
                    Перенести
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismiss(task.id)}
                    className="flex items-center justify-center w-6 h-6 rounded-md text-muted/40 hover:text-muted hover:bg-raised transition-all"
                    title="Відкласти"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Inline reason picker */}
              {expandedId === task.id && (
                <div className="ml-7 mb-2 flex flex-col gap-2 p-3 rounded-lg bg-raised border border-border/60 animate-in slide-in-from-top-1 duration-150">
                  <span className="text-note font-mono text-muted/60 uppercase tracking-wider">
                    Чому не виконав?
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedPreset((p) => (p === preset ? null : preset))}
                        className={`px-2.5 py-1 rounded-md text-note font-mono transition-all border ${
                          selectedPreset === preset
                            ? "bg-accent/20 border-accent/50 text-accent"
                            : "bg-raised border-border/60 text-muted hover:border-border hover:text-text"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      if (e.target.value) setSelectedPreset(null);
                    }}
                    placeholder="Інша причина..."
                    className="w-full bg-bg border border-border/60 rounded-md px-3 py-1.5 text-body text-text placeholder:text-muted/40 focus:outline-none focus:border-accent/40 transition-colors"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="px-3 py-1.5 text-note font-mono text-muted hover:text-text transition-colors"
                    >
                      Скасувати
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirm(task.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/20 border border-accent/40 text-note font-mono text-accent hover:bg-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={10} className={isPending ? "animate-spin" : ""} />
                      Підтвердити
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-1 text-body text-muted/60">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Check size={11} className="text-emerald-400" />
          </div>
          Всі завдання виконані
        </div>
      )}
    </div>
  );
}
