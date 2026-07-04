"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Dumbbell,
  ClipboardList,
  History as HistoryIcon,
  Play,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  ExerciseData,
  TrainingPlanData,
  TrainingDayData,
  TrainingDayExerciseData,
  TrainingSessionSummaryData,
} from "../types";
import { deleteExerciseAction } from "../actions/exercise-actions";
import {
  deleteTrainingPlanAction,
  deleteTrainingDayAction,
  deleteDayExerciseAction,
} from "../actions/training-plan-actions";
import { startSessionAction } from "../actions/training-session-actions";
import { ExerciseFormDialog } from "./ExerciseFormDialog";
import { TrainingPlanFormDialog } from "./TrainingPlanFormDialog";
import { TrainingDayFormDialog } from "./TrainingDayFormDialog";
import { DayExerciseFormDialog } from "./DayExerciseFormDialog";

interface TrainingPageClientProps {
  initialExercises: ExerciseData[];
  initialPlans: TrainingPlanData[];
  initialSessions: TrainingSessionSummaryData[];
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

export function TrainingPageClient({
  initialExercises,
  initialPlans,
  initialSessions,
}: TrainingPageClientProps) {
  const router = useRouter();
  const [isStarting, startStartTransition] = useTransition();

  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(
    new Set(initialPlans.slice(0, 1).map((p) => p.id)),
  );
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showArchivedExercises, setShowArchivedExercises] = useState(false);

  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlanData | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const [dayFormPlanId, setDayFormPlanId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<TrainingDayData | null>(null);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);

  const [dayExerciseFormDayId, setDayExerciseFormDayId] = useState<string | null>(null);
  const [selectedDayExercise, setSelectedDayExercise] = useState<TrainingDayExerciseData | null>(
    null,
  );
  const [dayExerciseToDelete, setDayExerciseToDelete] = useState<string | null>(null);

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

  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    const result = await deleteExerciseAction(exerciseToDelete);
    if (result.success) toast.success("Exercise deleted");
    else toast.error(result.error || "Failed to delete exercise");
    setExerciseToDelete(null);
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

  const activeExercises = initialExercises.filter((e) => !e.archived);
  const archivedExercises = initialExercises.filter((e) => e.archived);

  const plansTab = (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          className="rounded-xl px-5"
          onClick={() => {
            setSelectedPlan(null);
            setIsPlanFormOpen(true);
          }}
        >
          <Plus size={16} className="mr-1.5" />
          New plan
        </Button>
      </div>

      {initialPlans.length === 0 ? (
        <div className="bg-surface/30 border border-dashed border-border/40 rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-raised flex items-center justify-center border border-border">
            <ClipboardList size={32} className="text-muted/40" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-text">No training plans yet</p>
            <p className="text-note text-muted max-w-[280px]">
              Create a plan, add training days, then prescribe exercises to each day.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {initialPlans.map((plan) => {
            const isExpanded = expandedPlans.has(plan.id);
            return (
              <div
                key={plan.id}
                className="border border-border rounded-xl bg-surface/30 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => toggleSet(setExpandedPlans, plan.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-muted" />
                    ) : (
                      <ChevronDown size={16} className="text-muted" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-note font-bold text-text">{plan.name}</span>
                      {plan.description && (
                        <span className="text-caption text-muted">{plan.description}</span>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsPlanFormOpen(true);
                      }}
                      className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setPlanToDelete(plan.id)}
                      className="p-2 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/40 p-4 flex flex-col gap-4">
                    {plan.days.map((day) => {
                      const isDayExpanded = expandedDays.has(day.id);
                      return (
                        <div key={day.id} className="border border-border/60 rounded-lg bg-bg/40">
                          <div className="flex items-center justify-between gap-3 p-3">
                            <button
                              className="flex items-center gap-2 flex-1 text-left"
                              onClick={() => toggleSet(setExpandedDays, day.id)}
                            >
                              {isDayExpanded ? (
                                <ChevronUp size={14} className="text-muted" />
                              ) : (
                                <ChevronDown size={14} className="text-muted" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-note font-semibold text-text">
                                  {day.name}
                                </span>
                                {day.notes && (
                                  <span className="text-caption text-muted">{day.notes}</span>
                                )}
                              </div>
                            </button>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isStarting || day.exercises.length === 0}
                                onClick={() => handleStartSession(day.id)}
                                className="rounded-lg"
                              >
                                <Play size={14} className="mr-1.5" />
                                Start
                              </Button>
                              <button
                                onClick={() => {
                                  setDayFormPlanId(plan.id);
                                  setSelectedDay(day);
                                }}
                                className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDayToDelete(day.id)}
                                className="p-2 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {isDayExpanded && (
                            <div className="border-t border-border/40 p-3 flex flex-col gap-2">
                              {day.exercises.length === 0 ? (
                                <p className="text-caption text-muted">
                                  No exercises prescribed yet.
                                </p>
                              ) : (
                                day.exercises.map((de) => (
                                  <div
                                    key={de.id}
                                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface/50"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-note font-medium text-text">
                                        {de.exercise.name}
                                      </span>
                                      <span className="text-caption text-muted font-mono">
                                        {formatPrescription(de)}
                                        {de.targetRpe ? ` · RPE ${de.targetRpe}` : ""}
                                        {de.restSeconds ? ` · rest ${de.restSeconds}s` : ""}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          setDayExerciseFormDayId(day.id);
                                          setSelectedDayExercise(de);
                                        }}
                                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        onClick={() => setDayExerciseToDelete(de.id)}
                                        className="p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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
                                className="self-start mt-1"
                                onClick={() => {
                                  setDayExerciseFormDayId(day.id);
                                  setSelectedDayExercise(null);
                                }}
                              >
                                <Plus size={14} className="mr-1.5" />
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
                      className="self-start"
                      onClick={() => {
                        setDayFormPlanId(plan.id);
                        setSelectedDay(null);
                      }}
                    >
                      <Plus size={14} className="mr-1.5" />
                      New day
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const exercisesTab = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        {archivedExercises.length > 0 ? (
          <button
            onClick={() => setShowArchivedExercises(!showArchivedExercises)}
            className="text-label font-mono uppercase tracking-widest text-muted hover:text-text transition-colors"
          >
            {showArchivedExercises
              ? "Hide archived"
              : `Show archived (${archivedExercises.length})`}
          </button>
        ) : (
          <div />
        )}
        <Button
          variant="primary"
          size="sm"
          className="rounded-xl px-5"
          onClick={() => {
            setSelectedExercise(null);
            setIsExerciseFormOpen(true);
          }}
        >
          <Plus size={16} className="mr-1.5" />
          New exercise
        </Button>
      </div>

      {activeExercises.length === 0 && !showArchivedExercises ? (
        <div className="bg-surface/30 border border-dashed border-border/40 rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-raised flex items-center justify-center border border-border">
            <Dumbbell size={32} className="text-muted/40" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-text">No exercises in your library</p>
            <p className="text-note text-muted max-w-[280px]">
              Add exercises here, then prescribe them to your training days.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...activeExercises, ...(showArchivedExercises ? archivedExercises : [])].map((ex) => (
            <div
              key={ex.id}
              className={`border border-border rounded-xl p-4 flex flex-col gap-2 bg-surface/30 ${ex.archived ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-note font-bold text-text">{ex.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedExercise(ex);
                      setIsExerciseFormOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setExerciseToDelete(ex.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ex.muscleGroup && (
                  <span className="text-label font-mono px-2 py-0.5 rounded-full bg-raised text-muted">
                    {ex.muscleGroup}
                  </span>
                )}
                {ex.equipment && (
                  <span className="text-label font-mono px-2 py-0.5 rounded-full bg-raised text-muted">
                    {ex.equipment}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const historyTab = (
    <div className="flex flex-col gap-3">
      {initialSessions.length === 0 ? (
        <div className="bg-surface/30 border border-dashed border-border/40 rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-raised flex items-center justify-center border border-border">
            <HistoryIcon size={32} className="text-muted/40" />
          </div>
          <p className="text-base font-bold text-text">No sessions logged yet</p>
          <p className="text-note text-muted max-w-[280px]">
            Start a session from the Plans tab to begin logging your workouts.
          </p>
        </div>
      ) : (
        initialSessions.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/health/training/session/${s.id}`)}
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface/30 hover:bg-raised transition-colors text-left"
          >
            <div className="flex flex-col">
              <span className="text-note font-bold text-text">{s.dayName}</span>
              <span className="text-caption text-muted">
                {new Date(s.date).toLocaleDateString()} · {s._count.setLogs} sets
              </span>
            </div>
            <span
              className={`text-label font-mono uppercase px-2.5 py-1 rounded-full ${
                s.status === "completed"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {s.status === "completed" ? "Completed" : "In progress"}
            </span>
          </button>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <Tabs
        tabs={[
          { id: "plans", label: "Plans", icon: <ClipboardList size={16} />, content: plansTab },
          {
            id: "exercises",
            label: "Exercises",
            icon: <Dumbbell size={16} />,
            content: exercisesTab,
          },
          { id: "history", label: "History", icon: <HistoryIcon size={16} />, content: historyTab },
        ]}
      />

      <ExerciseFormDialog
        key={`exercise-form-${selectedExercise?.id ?? "new"}`}
        isOpen={isExerciseFormOpen}
        onClose={() => setIsExerciseFormOpen(false)}
        exercise={selectedExercise}
      />
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
        isOpen={!!exerciseToDelete}
        onClose={() => setExerciseToDelete(null)}
        onConfirm={confirmDeleteExercise}
        title="Delete exercise?"
        description="This will remove it from any training days that use it."
        confirmLabel="Delete"
        variant="danger"
      />
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
