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
    const [y, m, d] = date.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
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
    <div >
      {}
      <div >
        <div />
        <span >Task Review</span>
        <div />
      </div>

      {}
      <div >
        <div >
          <div >
            <div

            />
          </div>
          <span >
            {done} / {total} виконано
          </span>
        </div>
        {carriedTaskIds.length > 0 && (
          <div >
            <RefreshCw size={10} />
            <span >
              {carriedTaskIds.length} перенесено на завтра
            </span>
          </div>
        )}
      </div>

      {}
      {doneTasks.length > 0 && (
        <div >
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}

          >
            {showDone ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span >
              Виконано ({doneTasks.length})
            </span>
          </button>
          {showDone && (
            <div >
              {doneTasks.map((task) => (
                <div key={task.id} >
                  <div >
                    <Check size={9} />
                  </div>
                  {task.sphere && (
                    <div

                    />
                  )}
                  <span >{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {}
      {incompleteTasks.length > 0 ? (
        <div >
          {incompleteTasks.map((task) => (
            <div key={task.id} >
              <div >
                <div />
                {task.sphere && (
                  <div

                  />
                )}
                <span >{task.title}</span>
                <div >
                  <button
                    type="button"
                    onClick={() => handleOpenReason(task.id)}

                  >
                    <RefreshCw size={10} />
                    Перенести
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismiss(task.id)}

                    title="Відкласти"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {}
              {expandedId === task.id && (
                <div >
                  <span >
                    Чому не виконав?
                  </span>
                  <div >
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedPreset((p) => (p === preset ? null : preset))}

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

                  />
                  <div >
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}

                    >
                      Скасувати
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirm(task.id)}
                      disabled={isPending}

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
        <div >
          <div >
            <Check size={11} />
          </div>
          Всі завдання виконані
        </div>
      )}
    </div>
  );
}
