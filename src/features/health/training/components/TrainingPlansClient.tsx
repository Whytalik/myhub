"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { toast } from "sonner";
import { Plus, ClipboardList, Play, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type {
  TrainingPlanData,
  TrainingDayData,
  TrainingDayExerciseData,
  ExerciseData,
} from "../types";
import {
  deleteTrainingPlanAction,
  deleteTrainingDayAction,
  deleteDayExerciseAction,
} from "../actions/training-plan-actions";
import { startSessionAction } from "../actions/training-session-actions";
import { TrainingPlanFormDialog } from "./TrainingPlanFormDialog";
import { TrainingDayFormDialog } from "./TrainingDayFormDialog";
import { DayExerciseFormDialog } from "./DayExerciseFormDialog";

interface TrainingPlansClientProps {
  initialPlans: TrainingPlanData[];
  initialExercises: ExerciseData[];
}

function formatPrescription(de: TrainingDayExerciseData): string {
  const isTimeBased =
    de.exercise.trackingType === "duration" || de.exercise.trackingType === "cardio";
  if (isTimeBased) {
    const parts: string[] = [];
    if (de.targetDurationSeconds) parts.push(`${de.targetDurationSeconds}s`);
    if (de.targetDistanceMeters) parts.push(`${de.targetDistanceMeters}m`);
    return `${de.sets} × ${parts.join(" / ") || "—"}`;
  }
  const reps = de.targetReps ? `${de.targetReps}` : "—";
  const weight = de.targetWeight ? ` @ ${de.targetWeight}kg` : "";
  return `${de.sets} × ${reps}${weight}`;
}

export function TrainingPlansClient({ initialPlans, initialExercises }: TrainingPlansClientProps) {
  const router = useRouter();
  const [isStarting, startStartTransition] = useTransition();

  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(
    new Set(initialPlans.slice(0, 1).map((p) => p.id)),
  );
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlanData | null>(null);

  const [dayFormPlanId, setDayFormPlanId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<TrainingDayData | null>(null);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);

  const [dayExerciseFormDayId, setDayExerciseFormDayId] = useState<string | null>(null);
  const [selectedDayExercise, setSelectedDayExercise] = useState<TrainingDayExerciseData | null>(
    null,
  );
  const [dayExerciseToDelete, setDayExerciseToDelete] = useState<string | null>(null);

  const activeExercises = initialExercises.filter((e) => !e.archived);

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartSession = (dayId: string) => {
    startStartTransition(async () => {
      const result = await startSessionAction({ dayId });
      if (result.success) {
        router.push(`/health/training/session/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to start session");
      }
    });
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    const result = await deleteTrainingPlanAction(planToDelete);
    if (result.success) toast.success("Plan deleted");
    else toast.error(result.error || "Failed to delete plan");
    setPlanToDelete(null);
  };

  const confirmDeleteDay = async () => {
    if (!dayToDelete) return;
    const result = await deleteTrainingDayAction(dayToDelete);
    if (result.success) toast.success("Day deleted");
    else toast.error(result.error || "Failed to delete day");
    setDayToDelete(null);
  };

  const confirmDeleteDayExercise = async () => {
    if (!dayExerciseToDelete) return;
    const result = await deleteDayExerciseAction(dayExerciseToDelete);
    if (result.success) toast.success("Removed from day");
    else toast.error(result.error || "Failed to remove");
    setDayExerciseToDelete(null);
  };

  const iconActionClass =
    "p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors";
  const deleteActionClass =
    "p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors";
  const smallIconActionClass =
    "p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors";
  const smallDeleteActionClass =
    "p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelectedPlan(null);
            setIsPlanFormOpen(true);
          }}
        >
          <Plus size={16} />
          New plan
        </Button>
      </div>

      {initialPlans.length === 0 ? (
        <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-training/10 text-accent-training">
            <ClipboardList size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-panel-title">No training plans yet</p>
            <p className="text-caption max-w-sm">
              Create a plan, add training days, then prescribe exercises to each day.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {initialPlans.map((plan) => {
            const isExpanded = expandedPlans.has(plan.id);

            return (
              <div key={plan.id} className="glass-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggleSet(setExpandedPlans, plan.id)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left"
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-zinc-500 shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-zinc-500 shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-panel-title truncate">{plan.name}</span>
                      {plan.description && (
                        <span className="text-caption truncate">{plan.description}</span>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsPlanFormOpen(true);
                      }}
                      className={iconActionClass}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setPlanToDelete(plan.id)} className={deleteActionClass}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="flex flex-col gap-3 pl-6">
                    {plan.days.map((day) => {
                      const isDayExpanded = expandedDays.has(day.id);

                      return (
                        <div
                          key={day.id}
                          className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={() => toggleSet(setExpandedDays, day.id)}
                              className="flex items-center gap-2 min-w-0 flex-1 text-left"
                            >
                              {isDayExpanded ? (
                                <ChevronUp size={14} className="text-zinc-500 shrink-0" />
                              ) : (
                                <ChevronDown size={14} className="text-zinc-500 shrink-0" />
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-zinc-100 truncate">
                                  {day.name}
                                </span>
                                {day.notes && (
                                  <span className="text-caption truncate">{day.notes}</span>
                                )}
                              </div>
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isStarting || day.exercises.length === 0}
                                onClick={() => handleStartSession(day.id)}
                              >
                                <Play size={14} />
                                Start
                              </Button>
                              <button
                                onClick={() => {
                                  setDayFormPlanId(plan.id);
                                  setSelectedDay(day);
                                }}
                                className={smallIconActionClass}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDayToDelete(day.id)}
                                className={smallDeleteActionClass}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {isDayExpanded && (
                            <div className="flex flex-col gap-1.5 pl-5">
                              {day.exercises.length === 0 ? (
                                <p className="text-caption">No exercises prescribed yet.</p>
                              ) : (
                                day.exercises.map((de) => (
                                  <div
                                    key={de.id}
                                    className="flex items-center justify-between gap-2 py-1"
                                  >
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm text-zinc-200 truncate">
                                        {de.exercise.name}
                                      </span>
                                      <span className="text-caption">
                                        {formatPrescription(de)}
                                        {de.targetRpe ? ` · RPE ${de.targetRpe}` : ""}
                                        {de.restSeconds ? ` · rest ${de.restSeconds}s` : ""}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      <button
                                        onClick={() => {
                                          setDayExerciseFormDayId(day.id);
                                          setSelectedDayExercise(de);
                                        }}
                                        className={smallIconActionClass}
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        onClick={() => setDayExerciseToDelete(de.id)}
                                        className={smallDeleteActionClass}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDayExerciseFormDayId(day.id);
                                  setSelectedDayExercise(null);
                                }}
                              >
                                <Plus size={14} />
                                Add exercise
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDayFormPlanId(plan.id);
                        setSelectedDay(null);
                      }}
                    >
                      <Plus size={14} />
                      New day
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TrainingPlanFormDialog
        key={`plan-form-${selectedPlan?.id ?? "new"}`}
        isOpen={isPlanFormOpen}
        onClose={() => setIsPlanFormOpen(false)}
        plan={selectedPlan}
      />
      {dayFormPlanId && (
        <TrainingDayFormDialog
          key={`day-form-${selectedDay?.id ?? "new"}`}
          isOpen={!!dayFormPlanId}
          onClose={() => {
            setDayFormPlanId(null);
            setSelectedDay(null);
          }}
          planId={dayFormPlanId}
          day={selectedDay}
        />
      )}
      {dayExerciseFormDayId && (
        <DayExerciseFormDialog
          key={`day-exercise-form-${selectedDayExercise?.id ?? "new"}`}
          isOpen={!!dayExerciseFormDayId}
          onClose={() => {
            setDayExerciseFormDayId(null);
            setSelectedDayExercise(null);
          }}
          dayId={dayExerciseFormDayId}
          exercises={activeExercises}
          dayExercise={selectedDayExercise}
        />
      )}

      <ConfirmationDialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={confirmDeletePlan}
        title="Delete plan?"
        description="All days and prescriptions in this plan will be deleted. Session history is kept."
        confirmLabel="Delete"
        variant="danger"
      />
      <ConfirmationDialog
        isOpen={!!dayToDelete}
        onClose={() => setDayToDelete(null)}
        onConfirm={confirmDeleteDay}
        title="Delete day?"
        description="All exercise prescriptions in this day will be deleted."
        confirmLabel="Delete"
        variant="danger"
      />
      <ConfirmationDialog
        isOpen={!!dayExerciseToDelete}
        onClose={() => setDayExerciseToDelete(null)}
        onConfirm={confirmDeleteDayExercise}
        title="Remove exercise from day?"
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
