"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Dialog } from "@/components/ui/overlays/dialog";
import { EXERCISE_DETAILS } from "@/features/health/training/data/exercise-details";
import { toast } from "sonner";
import { Check, Dumbbell, Activity, ListChecks, Video, ChevronDown, ChevronRight } from "lucide-react";
import type { SetLogData, TrainingSessionData } from "../types";
import { updateSetLogAction, completeSessionAction } from "../actions/training-session-actions";

interface SessionClientProps {
  session: TrainingSessionData;
}

type EditableField =
  "reps" | "weight" | "rpe" | "restSeconds" | "durationSeconds" | "distanceMeters" | "notes";

export function SessionClient({ session }: SessionClientProps) {
  const router = useRouter();
  const [setLogs, setSetLogs] = useState<SetLogData[]>(session.setLogs);
  const [status, setStatus] = useState(session.status);
  const [isFinishing, startFinishTransition] = useTransition();
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(null);
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});
  const [warmupCollapsed, setWarmupCollapsed] = useState(true);

  const isCompleted = status === "completed";

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
      const result = await completeSessionAction({ id: session.id, durationSeconds });
      if (result.success) {
        setStatus("completed");
        toast.success("Workout finished");
      } else {
        toast.error(result.error || "Failed to finish workout");
      }
    });
  };

  const statusClass = `text-[10px] font-mono font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
    isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
  }`;
  const numberInputClass = "w-16 text-center shrink-0";
  const notesInputClass = "flex-1 min-w-[100px]";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <span className={statusClass}>{isCompleted ? "Completed" : "In progress"}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/health/training")}>
            Back to training
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
                <span className="text-xs font-bold uppercase tracking-wider font-mono">1. Розминка (Протокол RAMP)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                <span>~8-10 хв</span>
                <span>{warmupCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}</span>
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
                    3–5 хвилин легкого кардіо (еліпс, велотренажер або швидка ходьба). Підвищує температуру тіла, еластичність м'язів та ЧСС.
                  </p>
                </div>
                
                {/* Activate & Mobilize */}
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    2. Мобілізація (Mobilize)
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Динамічні обертання плечових суглобів, розкриття грудного відділу хребта, 10 присідань без ваги та 12 сідничних містків.
                  </p>
                </div>

                {/* Potentiate */}
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    3. Активація (Potentiate)
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    1–2 легкі розминочні підходи з 50% від робочої ваги для першої вправи дня, щоб підготувати ЦНС та суглоби.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-accent-training pl-1 mt-2">
            <Dumbbell size={16} />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">2. Основне тренування</span>
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
                    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                      isExerciseCompleted
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-500/10 border-white/[0.06] text-zinc-400"
                    }`}>
                      {isExerciseCompleted ? "✓ Виконано" : `${completedSets}/${totalSets} підходів`}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedExercise({ id: group.exerciseId, name: group.exerciseName })}
                    className="text-xs font-semibold text-accent-training hover:text-accent-training/80 transition-colors cursor-pointer select-none focus:outline-none outline-none"
                  >
                    Інфо та техніка
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col gap-2">
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-semibold font-mono uppercase tracking-wider text-zinc-500 select-none">
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

                    {group.sets.map((log) => {
                      const setToggleClass = `flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                        log.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-white/[0.12] text-zinc-500 hover:bg-white/5"
                      }`;

                      return (
                        <div key={log.id} className="flex items-center gap-2 flex-nowrap w-full min-w-0">
                          <button
                            onClick={() => toggleCompleted(log.id)}
                            disabled={isCompleted}
                            className={setToggleClass}
                          >
                            <Check size={14} />
                          </button>
                          <span className="font-mono text-xs text-zinc-500 w-4 text-center shrink-0">
                            {log.setNumber}
                          </span>

                          {isTimeBased ? (
                            <>
                              <Input
                                type="number"
                                min={0}
                                placeholder="—"
                                className={numberInputClass}
                                disabled={isCompleted}
                                value={log.durationSeconds ?? ""}
                                onChange={(e) =>
                                  updateField(
                                    log.id,
                                    "durationSeconds",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                onBlur={() => persist(log.id)}
                              />
                              <Input
                                type="number"
                                min={0}
                                step="0.1"
                                placeholder="—"
                                className={numberInputClass}
                                disabled={isCompleted}
                                value={log.distanceMeters ?? ""}
                                onChange={(e) =>
                                  updateField(
                                    log.id,
                                    "distanceMeters",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                onBlur={() => persist(log.id)}
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
                                value={log.reps ?? ""}
                                onChange={(e) =>
                                  updateField(
                                    log.id,
                                    "reps",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                onBlur={() => persist(log.id)}
                              />
                              <Input
                                type="number"
                                min={0}
                                step="0.5"
                                placeholder="—"
                                className={numberInputClass}
                                disabled={isCompleted}
                                value={log.weight ?? ""}
                                onChange={(e) =>
                                  updateField(
                                    log.id,
                                    "weight",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                onBlur={() => persist(log.id)}
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
                            value={log.rpe ?? ""}
                            onChange={(e) =>
                              updateField(
                                log.id,
                                  "rpe",
                                  e.target.value === "" ? null : Number(e.target.value),
                                )
                              }
                              onBlur={() => persist(log.id)}
                            />

                            <Input
                              type="number"
                              min={0}
                              placeholder="—"
                              className={numberInputClass}
                              disabled={isCompleted}
                              value={log.restSeconds ?? ""}
                              onChange={(e) =>
                                updateField(
                                  log.id,
                                  "restSeconds",
                                  e.target.value === "" ? null : Number(e.target.value),
                                )
                              }
                              onBlur={() => persist(log.id)}
                            />

                            <Input
                              placeholder="Нотатки..."
                              className={notesInputClass}
                              disabled={isCompleted}
                              value={log.notes ?? ""}
                              onChange={(e) => updateField(log.id, "notes", e.target.value)}
                              onBlur={() => persist(log.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
          })}
        </div>
      )}

      {/* Exercise Details Modal */}
      <Dialog
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name}
        maxWidth="640px"
      >
        {selectedExercise && (() => {
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
