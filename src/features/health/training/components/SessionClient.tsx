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

  return (
    <div >
      <div >
        <span

        >
          {isCompleted ? "Completed" : "In progress"}
        </span>
        <div >
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
        <div >
          <div >
            <Dumbbell size={32} />
          </div>
          <p >No sets in this session</p>
        </div>
      ) : (
        <div >
          {groups.map((group) => {
            const isTimeBased = group.sets.every(
              (s) => s.durationSeconds != null || s.distanceMeters != null,
            );
            return (
              <div
                key={group.exerciseId}

              >
                <div >
                  <span >{group.exerciseName}</span>
                </div>
                <div >
                  {group.sets.map((log) => (
                    <div key={log.id} >
                      <button
                        onClick={() => toggleCompleted(log.id)}
                        disabled={isCompleted}

                      >
                        <Check size={14} />
                      </button>
                      <span >
                        {log.setNumber}
                      </span>

                      {isTimeBased ? (
                        <>
                          <Input
                            type="number"
                            min={0}
                            placeholder="sec"

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

                        disabled={isCompleted}
                        value={log.notes ?? ""}
                        onChange={(e) => updateField(log.id, "notes", e.target.value)}
                        onBlur={() => persist(log.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
