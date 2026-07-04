"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { toast } from "sonner";
import { Check, Dumbbell } from "lucide-react";
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
    setSetLogs((prev) => prev.map((l) => (l.id === id ? { ...l, completed } : l)));
    updateSetLogAction({ id, completed }).then((result) => {
      if (!result.success) {
        toast.error(result.error || "Failed to update set");
        setSetLogs((prev) => prev.map((l) => (l.id === id ? { ...l, completed: !completed } : l)));
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
  const numberInputClass = "w-16 text-center";
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
          {groups.map((group) => {
            const isTimeBased = group.sets.every(
              (s) => s.durationSeconds != null || s.distanceMeters != null,
            );

            return (
              <div key={group.exerciseId} className="glass-card p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-panel-title">{group.exerciseName}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.sets.map((log) => {
                    const setToggleClass = `flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                      log.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-white/[0.12] text-zinc-500 hover:bg-white/5"
                    }`;

                    return (
                      <div key={log.id} className="flex items-center gap-2 flex-wrap">
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
                              placeholder="sec"
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
                              placeholder="m"
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
                              placeholder="reps"
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
                              placeholder="kg"
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
                          placeholder="RPE"
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
                          placeholder="rest s"
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
                          placeholder="notes"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
