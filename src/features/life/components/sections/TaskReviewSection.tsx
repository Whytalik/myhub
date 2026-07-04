"use client";

import { useState, useTransition, useMemo } from "react";
import { RefreshCw, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import type { TaskData } from "@/features/life/types";
import { carryOverTaskAction } from "@/features/life/actions/task-actions";

interface Props {
  tasks: TaskData[];
  date: string;
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
    const [y, m, d] = date.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
  }, [date]);

  const doneTasks = tasks.filter((t) => t.status === "DONE");
  const done = doneTasks.length;
  const visible = tasks.filter(
    (t) => !carriedTaskIds.includes(t.id) && !dismissedTaskIds.includes(t.id),
  );
  const incompleteTasks = visible.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED");
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

  const presetChipClass = (isActive: boolean) =>
    `px-2.5 py-1 rounded-lg text-xs border transition-colors duration-150 ${
      isActive
        ? "bg-accent/15 text-accent border-accent/30"
        : "text-zinc-400 border-white/[0.08] hover:bg-white/5"
    }`;

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-label">Task Review</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-caption whitespace-nowrap">
            {done} / {total} виконано
          </span>
        </div>
        {carriedTaskIds.length > 0 && (
          <div className="flex items-center gap-1 text-caption text-accent shrink-0">
            <RefreshCw size={10} />
            <span>{carriedTaskIds.length} перенесено на завтра</span>
          </div>
        )}
      </div>

      {doneTasks.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors w-fit"
          >
            {showDone ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>Виконано ({doneTasks.length})</span>
          </button>
          {showDone && (
            <div className="flex flex-col gap-1">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] text-sm text-zinc-400"
                >
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                    <Check size={9} />
                  </div>
                  {task.sphere && (
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: task.sphere.color }}
                    />
                  )}
                  <span className="truncate line-through">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {incompleteTasks.length > 0 ? (
        <div className="flex flex-col gap-2">
          {incompleteTasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-2 p-2.5 rounded-lg bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                {task.sphere && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.sphere.color }}
                  />
                )}
                <span className="text-sm text-zinc-200 truncate flex-1">{task.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenReason(task.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-accent hover:bg-accent/10 transition-colors"
                  >
                    <RefreshCw size={10} />
                    Перенести
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismiss(task.id)}
                    title="Відкласти"
                    className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {expandedId === task.id && (
                <div className="flex flex-col gap-2 pl-6">
                  <span className="text-caption">Чому не виконав?</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedPreset((p) => (p === preset ? null : preset))}
                        className={presetChipClass(selectedPreset === preset)}
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
                    className="glass-input px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 w-full"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Скасувати
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirm(task.id)}
                      disabled={isPending}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <RefreshCw size={10} />
                      Підтвердити
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-caption">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400">
            <Check size={11} />
          </div>
          Всі завдання виконані
        </div>
      )}
    </div>
  );
}
