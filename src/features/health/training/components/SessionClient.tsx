"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Dialog } from "@/components/ui/overlays/dialog";
import { EXERCISE_DETAILS } from "@/features/health/training/data/exercise-details";
import { toast } from "sonner";
import {
  Check,
  Dumbbell,
  Activity,
  ListChecks,
  Video,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
} from "lucide-react";
import type { SetLogData, TrainingSessionData } from "../types";
import {
  updateSetLogAction,
  completeSessionAction,
  updateSessionNotesAction,
} from "../actions/training-session-actions";
import { buildSessionReportMarkdown } from "../utils/session-report";

interface SessionClientProps {
  session: TrainingSessionData;
  pastLogs?: Record<
    string,
    {
      reps: number | null;
      weight: number | null;
      rpe: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
    }[]
  >;
}

type EditableField =
  "reps" | "weight" | "rpe" | "restSeconds" | "durationSeconds" | "distanceMeters" | "notes";

export function SessionClient({ session, pastLogs }: SessionClientProps) {
  const router = useRouter();
  const [setLogs, setSetLogs] = useState<SetLogData[]>(session.setLogs);
  const [status, setStatus] = useState(session.status);
  const [isFinishing, startFinishTransition] = useTransition();
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(
    null,
  );
  const isCompleted = status === "completed";

  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});
  const [warmupCollapsed, setWarmupCollapsed] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState(session.notes ?? "");

  useEffect(() => {
    if (isCompleted) {
      setElapsedSeconds(session.durationSeconds || 0);
      return;
    }

    const initialElapsed = Math.max(
      0,
      Math.round((Date.now() - new Date(session.createdAt).getTime()) / 1000),
    );
    setElapsedSeconds(initialElapsed);

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
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
      restSeconds: log.restSeconds,
      durationSeconds: log.durationSeconds,
      distanceMeters: log.distanceMeters,
      notes: log.notes,
    }).then((result) => {
      if (!result.success) toast.error(result.error || "Failed to save set");
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
    startFinishTransition(async () => {
      const durationSeconds = Math.max(
        0,
        Math.round((Date.now() - new Date(session.createdAt).getTime()) / 1000),
      );
      const result = await completeSessionAction({
        id: session.id,
        durationSeconds,
        notes: sessionNotes.trim() || null,
      });
      if (result.success) {
        setStatus("completed");
        toast.success("Workout finished");
      } else {
        toast.error(result.error || "Failed to finish workout");
      }
    });
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
        <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-training/10 text-accent-training">
            <Dumbbell size={32} />
          </div>
          <p className="text-panel-title">No sets in this session</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Collapsible Warmup Section */}
          <div className="bg-amber-500/[0.02] border border-amber-500/10 rounded-xl p-3 flex flex-col gap-2">
            <div
              onClick={() => setWarmupCollapsed(!warmupCollapsed)}
              className="flex items-center justify-between cursor-pointer select-none group/warmup"
            >
              <div className="flex items-center gap-2 text-amber-400">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  1. Розминка (Протокол RAMP)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                <span>~8-10 хв</span>
                <span>
                  {warmupCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </span>
              </div>
            </div>

            {!warmupCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1 border-t border-white/[0.04] mt-1">
                {/* Raise */}
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    1. Підвищення (Raise)
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    3–5 хвилин легкого кардіо (еліпс, велотренажер або швидка ходьба). Підвищує
                    температуру тіла, еластичність м'язів та ЧСС.
                  </p>
                </div>

                {/* Activate & Mobilize */}
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    2. Мобілізація (Mobilize)
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Динамічні обертання плечових суглобів, розкриття грудного відділу хребта, 10
                    присідань без ваги та 12 сідничних містків.
                  </p>
                </div>

                {/* Potentiate */}
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    3. Активація (Potentiate)
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    1–2 легкі розминочні підходи з 50% від робочої ваги для першої вправи дня, щоб
                    підготувати ЦНС та суглоби.
                  </p>
                </div>
              </div>
            )}
          </div>

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

            const toggleCollapse = () => {
              setCollapsedExercises((prev) => ({
                ...prev,
                [group.exerciseId]: !isCollapsed,
              }));
            };

            return (
              <div key={group.exerciseId} className="glass-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-2 mb-1">
                  <div
                    onClick={toggleCollapse}
                    className="flex items-center gap-2 cursor-pointer select-none group/title"
                  >
                    <span className="text-zinc-500 group-hover/title:text-zinc-300 transition-colors">
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </span>
                    <span className="text-panel-title group-hover/title:text-zinc-200 transition-colors">
                      {group.exerciseName}
                    </span>
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
                  </div>
                  <button
                    onClick={() =>
                      setSelectedExercise({ id: group.exerciseId, name: group.exerciseName })
                    }
                    className="text-xs font-semibold text-accent-training hover:text-accent-training/80 transition-colors cursor-pointer select-none focus:outline-none outline-none"
                  >
                    Інфо та техніка
                  </button>
                </div>

                {!isCollapsed && (
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

                      return (
                        <div
                          key={setLog.id}
                          className="flex flex-col gap-1 w-full border-b border-white/[0.04] md:border-white/[0.02] pb-3 md:pb-1.5 last:border-b-0 last:pb-0"
                        >
                          {/* Desktop Layout */}
                          <div className="hidden md:flex items-center gap-2 w-full min-w-0">
                            <button
                              onClick={() => toggleCompleted(setLog.id)}
                              disabled={isCompleted}
                              className={setToggleClass}
                            >
                              <Check size={14} />
                            </button>
                            <span className="font-mono text-xs text-zinc-500 w-4 text-center shrink-0">
                              {setLog.setNumber}
                            </span>

                            {isTimeBased ? (
                              <>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="—"
                                  className={numberInputClass}
                                  disabled={isCompleted}
                                  value={setLog.durationSeconds ?? ""}
                                  onChange={(event) =>
                                    updateField(
                                      setLog.id,
                                      "durationSeconds",
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                  onBlur={() => persist(setLog.id)}
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.1"
                                  placeholder="—"
                                  className={numberInputClass}
                                  disabled={isCompleted}
                                  value={setLog.distanceMeters ?? ""}
                                  onChange={(event) =>
                                    updateField(
                                      setLog.id,
                                      "distanceMeters",
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                  onBlur={() => persist(setLog.id)}
                                />
                              </>
                            ) : (
                              <>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="—"
                                  className={numberInputClass}
                                  disabled={isCompleted}
                                  value={setLog.reps ?? ""}
                                  onChange={(event) =>
                                    updateField(
                                      setLog.id,
                                      "reps",
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                  onBlur={() => persist(setLog.id)}
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.5"
                                  placeholder="—"
                                  className={numberInputClass}
                                  disabled={isCompleted}
                                  value={setLog.weight ?? ""}
                                  onChange={(event) =>
                                    updateField(
                                      setLog.id,
                                      "weight",
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                  onBlur={() => persist(setLog.id)}
                                />
                              </>
                            )}

                            <Input
                              type="number"
                              min={1}
                              max={10}
                              step="0.5"
                              placeholder="—"
                              className={numberInputClass}
                              disabled={isCompleted}
                              value={setLog.rpe ?? ""}
                              onChange={(event) =>
                                updateField(
                                  setLog.id,
                                  "rpe",
                                  event.target.value === "" ? null : Number(event.target.value),
                                )
                              }
                              onBlur={() => persist(setLog.id)}
                            />

                            <Input
                              type="number"
                              min={0}
                              placeholder="—"
                              className={numberInputClass}
                              disabled={isCompleted}
                              value={setLog.restSeconds ?? ""}
                              onChange={(event) =>
                                updateField(
                                  setLog.id,
                                  "restSeconds",
                                  event.target.value === "" ? null : Number(event.target.value),
                                )
                              }
                              onBlur={() => persist(setLog.id)}
                            />

                            <Input
                              placeholder="Нотатки..."
                              className={notesInputClass}
                              disabled={isCompleted}
                              value={setLog.notes ?? ""}
                              onChange={(event) =>
                                updateField(setLog.id, "notes", event.target.value)
                              }
                              onBlur={() => persist(setLog.id)}
                            />
                          </div>

                          {pastSet && (
                            <div className="hidden md:flex items-center gap-1.5 pl-13 text-[10px] text-zinc-500 font-mono select-none">
                              <span>Минулого разу:</span>
                              {isTimeBased ? (
                                <span className="text-zinc-400">
                                  {pastSet.durationSeconds ? `${pastSet.durationSeconds}с` : "—"}
                                  {pastSet.distanceMeters ? ` / ${pastSet.distanceMeters}м` : ""}
                                </span>
                              ) : (
                                <span className="text-zinc-400 font-bold">
                                  {pastSet.weight !== null ? `${pastSet.weight}кг` : "—"}
                                  {" х "}
                                  {pastSet.reps !== null ? `${pastSet.reps}` : "—"}
                                </span>
                              )}
                              {pastSet.rpe && (
                                <span className="text-zinc-500">@ RPE {pastSet.rpe}</span>
                              )}
                            </div>
                          )}

                          {/* Mobile Layout */}
                          <div className="flex md:hidden flex-col gap-2.5 w-full">
                            {/* Header: Set Number, Completed Checkbox, Past Set Info */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleCompleted(setLog.id)}
                                  disabled={isCompleted}
                                  className={setToggleClass}
                                >
                                  <Check size={16} />
                                </button>
                                <span className="font-mono text-sm font-semibold text-zinc-300">
                                  Сет {setLog.setNumber}
                                </span>
                              </div>

                              {pastSet && (
                                <div className="text-[11px] text-zinc-500 font-mono select-none flex items-center gap-1 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.04]">
                                  <span className="text-zinc-500">Минулого разу:</span>
                                  {isTimeBased ? (
                                    <span className="text-zinc-400 font-medium">
                                      {pastSet.durationSeconds
                                        ? `${pastSet.durationSeconds}с`
                                        : "—"}
                                      {pastSet.distanceMeters
                                        ? ` / ${pastSet.distanceMeters}м`
                                        : ""}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 font-bold">
                                      {pastSet.weight !== null ? `${pastSet.weight}кг` : "—"}
                                      {" х "}
                                      {pastSet.reps !== null ? `${pastSet.reps}` : "—"}
                                    </span>
                                  )}
                                  {pastSet.rpe && (
                                    <span className="text-zinc-500">@ {pastSet.rpe}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Inputs Grid */}
                            <div className="grid grid-cols-4 gap-2">
                              {/* Input 1: Reps / Time */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
                                  {isTimeBased ? "Час (с)" : "Повт"}
                                </label>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="—"
                                  className="w-full text-center text-sm px-1 h-9 rounded-lg"
                                  disabled={isCompleted}
                                  value={
                                    isTimeBased
                                      ? (setLog.durationSeconds ?? "")
                                      : (setLog.reps ?? "")
                                  }
                                  onChange={(event) =>
                                    updateField(
                                      setLog.id,
                                      isTimeBased ? "durationSeconds" : "reps",
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                  onBlur={() => persist(setLog.id)}
                                />
                              </div>

                              {/* Input 2: Weight / Distance */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
                                  {isTimeBased ? "Дист (м)" : "Вага"}
                                </label>
                                <Input
                                  type="number"
                                  min={0}
                                  step={isTimeBased ? "0.1" : "0.5"}
                                  placeholder="—"
                                  className="w-full text-center text-sm px-1 h-9 rounded-lg"
                                  disabled={isCompleted}
                                  value={
                                    isTimeBased
                                      ? (setLog.distanceMeters ?? "")
                                      : (setLog.weight ?? "")
                                  }
                                  onChange={(event) =>
                                    updateField(
                                      setLog.id,
                                      isTimeBased ? "distanceMeters" : "weight",
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                  onBlur={() => persist(setLog.id)}
                                />
                              </div>

                              {/* Input 3: RPE */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
                                  RPE
                                </label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  step="0.5"
                                  placeholder="—"
                                  className="w-full text-center text-sm px-1 h-9 rounded-lg"
                                  disabled={isCompleted}
                                  value={setLog.rpe ?? ""}
                                  onChange={(event) =>
                                    updateField(
                                      setLog.id,
                                      "rpe",
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                  onBlur={() => persist(setLog.id)}
                                />
                              </div>

                              {/* Input 4: Rest */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
                                  Відпоч
                                </label>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="—"
                                  className="w-full text-center text-sm px-1 h-9 rounded-lg"
                                  disabled={isCompleted}
                                  value={setLog.restSeconds ?? ""}
                                  onChange={(event) =>
                                    updateField(
                                      setLog.id,
                                      "restSeconds",
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                  onBlur={() => persist(setLog.id)}
                                />
                              </div>
                            </div>

                            {/* Full-width Notes Textarea */}
                            <div className="flex flex-col gap-1 w-full">
                              <Textarea
                                placeholder="Нотатки до підходу..."
                                className="w-full text-xs min-h-[44px] py-2 px-2.5 rounded-lg border border-white/[0.04] bg-black/15 focus:bg-black/25 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 resize-none"
                                disabled={isCompleted}
                                value={setLog.notes ?? ""}
                                onChange={(event) =>
                                  updateField(setLog.id, "notes", event.target.value)
                                }
                                onBlur={() => persist(setLog.id)}
                              />
                            </div>
                          </div>
                        </div>
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
      <Dialog
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name}
        maxWidth="640px"
      >
        {selectedExercise &&
          (() => {
            const details = EXERCISE_DETAILS[selectedExercise.name];
            return (
              <div className="flex flex-col gap-5 text-sm pb-2">
                {/* Biomechanics */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-accent-training flex items-center gap-1.5 border-b border-white/[0.04] pb-1">
                    <Activity size={14} />
                    Науковий аналіз
                  </h4>
                  <p className="text-zinc-300 leading-relaxed text-xs">
                    {details?.explanation || "Пояснення вправи ще додається."}
                  </p>
                  {details?.scientificInsight && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed italic bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                      {details.scientificInsight}
                    </p>
                  )}
                </div>

                {/* Technique */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-blue-400 flex items-center gap-1.5 border-b border-white/[0.04] pb-1">
                    <ListChecks size={14} />
                    Техніка виконання
                  </h4>
                  <div className="flex flex-col gap-2">
                    {details?.technique ? (
                      details.technique.split("\n").map((step, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-xs text-zinc-300">
                          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/[0.08] text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="pt-0.5">{step.replace(/^\d+\.\s*/, "")}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400 italic">Слідкуйте за правильною формою.</p>
                    )}
                  </div>
                </div>

                {/* Video Player */}
                {details?.videoUrl && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-red-400 flex items-center gap-1.5 border-b border-white/[0.04] pb-1">
                      <Video size={14} />
                      Відеопояснення
                    </h4>
                    <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/[0.08] bg-black/20 mt-1">
                      <iframe
                        className="w-full h-full"
                        src={details.videoUrl}
                        title={`Відеопояснення: ${selectedExercise.name}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Open Full Page */}
                <div className="flex justify-between items-center pt-3 border-t border-white/[0.06] mt-1">
                  <Link
                    href={`/health/training/exercises/${selectedExercise.id}`}
                    target="_blank"
                    className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors underline flex items-center gap-1 focus:outline-none"
                  >
                    Відкрити повну сторінку вправи в новій вкладці →
                  </Link>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedExercise(null)}>
                    Закрити
                  </Button>
                </div>
              </div>
            );
          })()}
      </Dialog>
    </div>
  );
}
