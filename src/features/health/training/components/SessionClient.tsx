"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/actions/button";
import { EmptyState } from "@/components/ui/display/empty-state";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { toast } from "sonner";
import { useServerAction } from "@/lib/hooks/use-server-action";
import {
  Dumbbell,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { SetLogData, TrainingSessionData, TrainingGoal } from "../types";
import type { ProgressionSuggestion } from "../utils/progression";
import {
  updateSetLogAction,
  completeSessionAction,
  updateSessionNotesAction,
  skipExerciseAction,
  unskipExerciseAction,
} from "../actions/training-session-actions";
import { buildSessionReportMarkdown } from "../utils/session-report";
import { SessionWarmupSection } from "./SessionWarmupSection";
import { SessionSetRow } from "./SessionSetRow";
import { SessionExerciseDetailsModal } from "./SessionExerciseDetailsModal";

const SKIP_REASONS = ["Втома", "Травма/біль", "Брак часу", "Нема обладнання", "Інше"] as const;
const CUSTOM_SKIP_REASON = "Інше";

interface SessionClientProps {
  session: TrainingSessionData;
  pastLogs?: Record<
    string,
    {
      reps: number | null;
      weight: number | null;
      rpe: number | null;
      rir: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
    }[]
  >;
  progressionSuggestions?: Record<string, ProgressionSuggestion>;
  goalsByExerciseId?: Record<string, TrainingGoal>;
}

export type EditableField =
  | "reps"
  | "weight"
  | "rpe"
  | "rir"
  | "restSeconds"
  | "durationSeconds"
  | "distanceMeters"
  | "notes";

export function SessionClient({
  session,
  pastLogs,
  progressionSuggestions,
  goalsByExerciseId,
}: SessionClientProps) {
  const router = useRouter();
  const [setLogs, setSetLogs] = useState<SetLogData[]>(session.setLogs);
  const [status, setStatus] = useState(session.status);
  const { run: runFinish, isPending: isFinishing } = useServerAction();
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(
    null,
  );
  const isCompleted = status === "completed";

  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});
  const [warmupCollapsed, setWarmupCollapsed] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState(session.notes ?? "");
  const [skipPanelExerciseId, setSkipPanelExerciseId] = useState<string | null>(null);
  const [selectedSkipReason, setSelectedSkipReason] = useState<string | null>(null);
  const [skipNote, setSkipNote] = useState("");

  useEffect(() => {
    if (isCompleted) {
      // No ticking interval follows on this path, just seeding the final duration once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedSeconds(session.durationSeconds || 0);
      return;
    }

    const createdAtMs = new Date(session.createdAt).getTime();
    const tick = () => {
      setElapsedSeconds(Math.max(0, Math.round((Date.now() - createdAtMs) / 1000)));
    };

    tick();
    // Recomputed from wall-clock time on every tick (not incremented by 1)
    // so it self-corrects after the interval is throttled or fully paused
    // while the tab/app is backgrounded — a `+1 per tick` counter would
    // permanently lag behind once minimized.
    const interval = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [isCompleted, session.createdAt, session.durationSeconds]);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) {
      parts.push(hours.toString().padStart(2, "0"));
    }
    parts.push(minutes.toString().padStart(2, "0"));
    parts.push(seconds.toString().padStart(2, "0"));

    return parts.join(":");
  };

  const groups = useMemo(() => {
    const result: { exerciseId: string; exerciseName: string; sets: SetLogData[] }[] = [];
    for (const log of setLogs) {
      const last = result[result.length - 1];
      if (last && last.exerciseId === log.exerciseId) {
        last.sets.push(log);
      } else {
        result.push({ exerciseId: log.exerciseId, exerciseName: log.exerciseName, sets: [log] });
      }
    }
    return result;
  }, [setLogs]);

  const updateField = (id: string, field: EditableField, value: number | string | null) => {
    setSetLogs((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const persist = (id: string) => {
    const log = setLogs.find((l) => l.id === id);
    if (!log) return;
    updateSetLogAction({
      id: log.id,
      reps: log.reps,
      weight: log.weight,
      rpe: log.rpe,
      rir: log.rir,
      restSeconds: log.restSeconds,
      durationSeconds: log.durationSeconds,
      distanceMeters: log.distanceMeters,
      notes: log.notes,
    }).then((result) => {
      if (!result.success) toast.error(result.error || "Failed to save set");
    });
  };

  const toggleWarmup = (id: string) => {
    const log = setLogs.find((l) => l.id === id);
    if (!log) return;
    const isWarmup = !log.isWarmup;

    setSetLogs((prev) => prev.map((l) => (l.id === id ? { ...l, isWarmup } : l)));

    updateSetLogAction({ id, isWarmup }).then((result) => {
      if (!result.success) {
        toast.error(result.error || "Failed to update set");
        setSetLogs((prev) => prev.map((l) => (l.id === id ? { ...l, isWarmup: !isWarmup } : l)));
      }
    });
  };

  const openSkipPanel = (exerciseId: string) => {
    setSelectedSkipReason(null);
    setSkipNote("");
    setSkipPanelExerciseId(exerciseId);
  };

  const isCustomSkipReason = selectedSkipReason === CUSTOM_SKIP_REASON;
  const canConfirmSkip = isCustomSkipReason ? !!skipNote.trim() : !!selectedSkipReason;

  const confirmSkipExercise = () => {
    if (!skipPanelExerciseId || !canConfirmSkip) return;
    const exerciseId = skipPanelExerciseId;
    const reason = isCustomSkipReason
      ? skipNote.trim()
      : skipNote.trim()
        ? `${selectedSkipReason} — ${skipNote.trim()}`
        : selectedSkipReason!;

    setSkipPanelExerciseId(null);
    setSetLogs((prev) =>
      prev.map((l) =>
        l.exerciseId === exerciseId
          ? { ...l, skipped: true, skipReason: reason, completed: false }
          : l,
      ),
    );

    skipExerciseAction(session.id, exerciseId, reason).then((result) => {
      if (!result.success) toast.error(result.error || "Не вдалося позначити вправу");
    });
  };

  const undoSkipExercise = (exerciseId: string) => {
    setSetLogs((prev) =>
      prev.map((l) =>
        l.exerciseId === exerciseId ? { ...l, skipped: false, skipReason: null } : l,
      ),
    );

    unskipExerciseAction(session.id, exerciseId).then((result) => {
      if (!result.success) toast.error(result.error || "Не вдалося скасувати пропуск");
    });
  };

  const toggleCompleted = (id: string) => {
    const log = setLogs.find((l) => l.id === id);
    if (!log) return;
    const completed = !log.completed;

    setSetLogs((prev) => {
      const nextLogs = prev.map((l) => (l.id === id ? { ...l, completed } : l));

      // Auto-collapse if all sets for this exercise are now completed
      const exerciseSets = nextLogs.filter((l) => l.exerciseId === log.exerciseId);
      const allCompleted = exerciseSets.every((s) => s.completed);

      setCollapsedExercises((prevCollapsed) => ({
        ...prevCollapsed,
        [log.exerciseId]: allCompleted,
      }));

      return nextLogs;
    });

    updateSetLogAction({ id, completed }).then((result) => {
      if (!result.success) {
        toast.error(result.error || "Failed to update set");
        setSetLogs((prev) => {
          const nextLogs = prev.map((l) => (l.id === id ? { ...l, completed: !completed } : l));

          // Re-evaluate collapse state if toggle failed
          const exerciseSets = nextLogs.filter((l) => l.exerciseId === log.exerciseId);
          const allCompleted = exerciseSets.every((s) => s.completed);

          setCollapsedExercises((prevCollapsed) => ({
            ...prevCollapsed,
            [log.exerciseId]: allCompleted,
          }));

          return nextLogs;
        });
      }
    });
  };

  const handleFinish = () => {
    const durationSeconds = Math.max(
      0,
      Math.round((Date.now() - new Date(session.createdAt).getTime()) / 1000),
    );
    runFinish(
      completeSessionAction({
        id: session.id,
        durationSeconds,
        notes: sessionNotes.trim() || null,
      }),
      {
        successMessage: "Workout finished",
        errorMessage: "Failed to finish workout",
        onSuccess: () => setStatus("completed"),
      },
    );
  };

  const handleNotesBlur = () => {
    updateSessionNotesAction(session.id, sessionNotes.trim() || null).then((result) => {
      if (!result.success) {
        toast.error(result.error || "Не вдалося зберегти нотатки");
      }
    });
  };

  const handleCopyReport = () => {
    const report = buildSessionReportMarkdown({
      dayName: session.dayName,
      date: session.date,
      durationSeconds: elapsedSeconds,
      status,
      setLogs,
      notes: sessionNotes,
    });
    navigator.clipboard
      .writeText(report)
      .then(() => toast.success("Звіт скопійовано"))
      .catch(() => toast.error("Не вдалося скопіювати звіт"));
  };

  const statusClass = `text-[10px] font-mono font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
    isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
  }`;
  const numberInputClass = "w-16 text-center shrink-0";
  const notesInputClass = "w-full md:flex-1 md:w-auto md:min-w-[100px]";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={statusClass}>{isCompleted ? "Completed" : "In progress"}</span>
          <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5 bg-white/5 border border-white/[0.06] px-2.5 py-0.5 rounded-md">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-zinc-500" : "bg-emerald-500 animate-pulse"}`}
            ></span>
            {formatDuration(elapsedSeconds)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/health/training")}>
            Back to training
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopyReport}>
            <ClipboardCopy size={14} />
            Копіювати звіт
          </Button>
          {!isCompleted && (
            <Button variant="primary" size="sm" disabled={isFinishing} onClick={handleFinish}>
              {isFinishing ? "Finishing..." : "Finish workout"}
            </Button>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          accentClassName="bg-accent-training/10 text-accent-training"
          title="No sets in this session"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Collapsible Warmup Section */}
          <SessionWarmupSection
            warmupCollapsed={warmupCollapsed}
            setWarmupCollapsed={setWarmupCollapsed}
          />

          <div className="flex items-center gap-2 text-accent-training pl-1 mt-2">
            <Dumbbell size={16} />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              2. Основне тренування
            </span>
          </div>

          {groups.map((group) => {
            const isTimeBased = group.sets.every(
              (s) => s.durationSeconds != null || s.distanceMeters != null,
            );

            const completedSets = group.sets.filter((s) => s.completed).length;
            const totalSets = group.sets.length;
            const isExerciseCompleted = completedSets === totalSets;
            const isCollapsed = collapsedExercises[group.exerciseId] ?? false;
            const isSkipped = group.sets[0]?.skipped ?? false;
            const skipReason = group.sets[0]?.skipReason ?? null;
            const suggestion = progressionSuggestions?.[group.exerciseId];
            const isSkipPanelOpen = skipPanelExerciseId === group.exerciseId;

            const toggleCollapse = () => {
              setCollapsedExercises((prev) => ({
                ...prev,
                [group.exerciseId]: !isCollapsed,
              }));
            };

            return (
              <div
                key={group.exerciseId}
                className={`glass-card p-4 flex flex-col gap-3 ${isSkipped ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-2 mb-1">
                  <div
                    onClick={toggleCollapse}
                    className="flex items-center gap-2 cursor-pointer select-none group/title flex-wrap"
                  >
                    <span className="text-zinc-500 group-hover/title:text-zinc-300 transition-colors">
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </span>
                    <span className="text-panel-title group-hover/title:text-zinc-200 transition-colors">
                      {group.exerciseName}
                    </span>
                    {isSkipped ? (
                      <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-zinc-500/10 border-white/[0.06] text-zinc-400">
                        Пропущено
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                          isExerciseCompleted
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-zinc-500/10 border-white/[0.06] text-zinc-400"
                        }`}
                      >
                        {isExerciseCompleted
                          ? "✓ Виконано"
                          : `${completedSets}/${totalSets} підходів`}
                      </span>
                    )}
                    {suggestion && !isSkipped && (
                      <span
                        title={suggestion.message}
                        className="flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-400"
                      >
                        <TrendingUp size={11} />
                        {suggestion.message}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {!isCompleted && !isSkipped && (
                      <button
                        onClick={() => openSkipPanel(group.exerciseId)}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer select-none focus:outline-none outline-none"
                      >
                        Не виконав
                      </button>
                    )}
                    {isSkipped && (
                      <button
                        onClick={() => undoSkipExercise(group.exerciseId)}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer select-none underline underline-offset-2 focus:outline-none outline-none"
                      >
                        Скасувати
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setSelectedExercise({ id: group.exerciseId, name: group.exerciseName })
                      }
                      className="text-xs font-semibold text-accent-training hover:text-accent-training/80 transition-colors cursor-pointer select-none focus:outline-none outline-none"
                    >
                      Інфо та техніка
                    </button>
                  </div>
                </div>

                {isSkipPanelOpen && (
                  <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-caption">Чому пропускаєте цю вправу?</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SKIP_REASONS.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() =>
                            setSelectedSkipReason((r) => (r === reason ? null : reason))
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs border transition-colors duration-150 ${
                            selectedSkipReason === reason
                              ? "bg-accent/15 text-accent border-accent/30"
                              : "text-zinc-400 border-white/[0.08] hover:bg-white/5"
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={skipNote}
                      onChange={(e) => setSkipNote(e.target.value)}
                      placeholder={
                        isCustomSkipReason ? "Опишіть причину..." : "Деталі (необов'язково)..."
                      }
                      className="text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSkipPanelExerciseId(null)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Скасувати
                      </button>
                      <button
                        type="button"
                        onClick={confirmSkipExercise}
                        disabled={!canConfirmSkip}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Підтвердити
                      </button>
                    </div>
                  </div>
                )}

                {isSkipped && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <XCircle size={12} className="shrink-0" />
                    <span className="truncate">Причина: {skipReason}</span>
                  </div>
                )}

                {!isCollapsed && !isSkipped && (
                  <div className="flex flex-col gap-2">
                    {/* Header Row */}
                    <div className="hidden md:flex items-center gap-2 mb-1 px-1 text-[10px] font-semibold font-mono uppercase tracking-wider text-zinc-500 select-none">
                      <div className="w-7 shrink-0 text-center">Статус</div>
                      <div className="w-4 shrink-0 text-center">Сет</div>
                      {isTimeBased ? (
                        <>
                          <div className="w-16 shrink-0 text-center">Час (с)</div>
                          <div className="w-16 shrink-0 text-center">Дист (м)</div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 shrink-0 text-center">Повт</div>
                          <div className="w-16 shrink-0 text-center">Вага (кг)</div>
                        </>
                      )}
                      <div className="w-16 shrink-0 text-center">RPE</div>
                      <div className="w-16 shrink-0 text-center">RIR</div>
                      <div className="w-16 shrink-0 text-center">Відпоч</div>
                      <div className="flex-1 min-w-[100px] pl-2 text-left">Нотатки</div>
                    </div>

                    {group.sets.map((setLog) => {
                      const setToggleClass = `flex items-center justify-center w-9 h-9 md:w-7 md:h-7 rounded-lg border shrink-0 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                        setLog.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-white/[0.12] text-zinc-500 hover:bg-white/5"
                      }`;

                      const exercisePastLogs = pastLogs?.[group.exerciseId];
                      const pastSet = exercisePastLogs?.[setLog.setNumber - 1];
                      const warmupToggleClass = `flex items-center justify-center w-6 h-6 rounded-md border shrink-0 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                        setLog.isWarmup
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                          : "border-white/[0.08] text-zinc-600 hover:bg-white/5"
                      }`;

                      return (
                        <SessionSetRow
                          key={setLog.id}
                          setLog={setLog}
                          isCompleted={isCompleted}
                          isTimeBased={isTimeBased}
                          toggleCompleted={toggleCompleted}
                          toggleWarmup={toggleWarmup}
                          updateField={updateField}
                          persist={persist}
                          setToggleClass={setToggleClass}
                          warmupToggleClass={warmupToggleClass}
                          numberInputClass={numberInputClass}
                          notesInputClass={notesInputClass}
                          pastSet={pastSet}
                          goal={goalsByExerciseId?.[group.exerciseId] ?? "hypertrophy"}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Session notes */}
          <div className="glass-card p-4 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400">
              Загальні нотатки по сесії
            </label>
            <Textarea
              className="min-h-[80px]"
              placeholder="Самопочуття, сон, стрес, загальні спостереження за тренуванням..."
              value={sessionNotes}
              onChange={(event) => setSessionNotes(event.target.value)}
              onBlur={handleNotesBlur}
            />
          </div>
        </div>
      )}

      {/* Exercise Details Modal */}
      <SessionExerciseDetailsModal
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
      />
    </div>
  );
}
