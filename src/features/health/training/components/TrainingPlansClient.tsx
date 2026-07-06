"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/actions/button";
import { SectionHeader } from "@/components/ui/display/section-header";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { toast } from "sonner";
import {
  Plus,
  ClipboardList,
  Dumbbell,
  Play,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Activity,
  Info,
} from "lucide-react";
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
import { upsertDayScheduleAction } from "@/features/life/actions/schedule-actions";
import { TrainingPlanFormDialog } from "./TrainingPlanFormDialog";
import { TrainingDayFormDialog } from "./TrainingDayFormDialog";
import { DayExerciseFormDialog } from "./DayExerciseFormDialog";

function todayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface TrainingPlansClientProps {
  initialPlans: TrainingPlanData[];
  initialExercises: ExerciseData[];
  initialWeekAssignments: Record<number, string | null>;
}

function WeekdayAssignmentRow({
  dayId,
  assignments,
  onToggle,
}: {
  dayId: string;
  assignments: Record<number, string | null>;
  onToggle: (dayOfWeek: number, nextTrainingDayId: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {WEEKDAY_LETTERS.map((letter, dayOfWeek) => {
        const isAssignedHere = assignments[dayOfWeek] === dayId;
        const isAssignedElsewhere = !!assignments[dayOfWeek] && !isAssignedHere;
        const buttonClass = `flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-mono font-semibold transition-colors duration-150 border ${
          isAssignedHere
            ? "bg-accent-training/20 text-accent-training border-accent-training/40"
            : isAssignedElsewhere
              ? "bg-transparent text-zinc-700 border-white/[0.04]"
              : "bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:bg-white/5"
        }`;

        return (
          <button
            key={dayOfWeek}
            type="button"
            title={WEEKDAY_NAMES[dayOfWeek]}
            onClick={() => onToggle(dayOfWeek, isAssignedHere ? null : dayId)}
            className={buttonClass}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
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

function calculateWeeklyVolume(days: TrainingDayData[]) {
  const volumeMap: Record<string, number> = {};
  for (const day of days) {
    for (const de of day.exercises) {
      if (!de.exercise) continue;
      const muscle = de.exercise.muscleGroup || "Інше";
      const muscles = muscle.split(/[\/,]|\s+та\s+/).map((m) => m.trim());
      for (const m of muscles) {
        if (m) {
          volumeMap[m] = (volumeMap[m] || 0) + de.sets;
        }
      }
    }
  }
  return Object.entries(volumeMap)
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets);
}

function getVolumeStatus(sets: number) {
  if (sets < 6) {
    return {
      label: "Підтримка",
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      barColor: "bg-amber-500",
      description: "1-5 підходів: об'єм підтримки (MV). Мало для росту, але добре для підтримки або відновлення.",
    };
  } else if (sets <= 20) {
    return {
      label: "Оптимально",
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      barColor: "bg-emerald-500",
      description: "6-20 підходів: оптимальна зона для гіпертрофії (MEV/MAV). Найкращий баланс росту та відновлення.",
    };
  } else {
    return {
      label: "Надмірно",
      colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      barColor: "bg-rose-500",
      description: "20+ підходів: перевищує об'єм відновлення (MRV). Високий ризик перетренованості та накопичення втоми.",
    };
  }
}

export function TrainingPlansClient({
  initialPlans,
  initialExercises,
  initialWeekAssignments,
}: TrainingPlansClientProps) {
  const router = useRouter();
  const [isStarting, startStartTransition] = useTransition();
  const [, startScheduleTransition] = useTransition();

  const plan = initialPlans[0] ?? null;

  const [weekAssignments, setWeekAssignments] =
    useState<Record<number, string | null>>(initialWeekAssignments);
  const today = todayDayOfWeek();

  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set(plan?.days.slice(0, 1).map((d) => d.id) ?? []),
  );
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);

  const [dayFormOpen, setDayFormOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<TrainingDayData | null>(null);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);

  const [dayExerciseFormDayId, setDayExerciseFormDayId] = useState<string | null>(null);
  const [selectedDayExercise, setSelectedDayExercise] = useState<TrainingDayExerciseData | null>(
    null,
  );
  const [dayExerciseToDelete, setDayExerciseToDelete] = useState<string | null>(null);
  const [showVolumeAnalysis, setShowVolumeAnalysis] = useState(true);

  const activeExercises = initialExercises.filter((e) => !e.archived);

  const toggleDay = (id: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleWeekday = (dayOfWeek: number, nextTrainingDayId: string | null) => {
    const prev = weekAssignments[dayOfWeek] ?? null;
    setWeekAssignments((s) => ({ ...s, [dayOfWeek]: nextTrainingDayId }));

    startScheduleTransition(async () => {
      const result = await upsertDayScheduleAction({ dayOfWeek, trainingDayId: nextTrainingDayId });
      if (!result.success) {
        setWeekAssignments((s) => ({ ...s, [dayOfWeek]: prev }));
        toast.error(result.error || "Failed to update schedule");
      }
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
  const badgeClass =
    "text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-400";

  return (
    <div className="flex flex-col gap-6">
      {!plan ? (
        <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-training/10 text-accent-training">
            <ClipboardList size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-panel-title">No training plan yet</p>
            <p className="text-caption max-w-sm">
              Create your plan, add training days, then prescribe exercises to each day.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsPlanFormOpen(true)}>
            <Plus size={16} />
            Create plan
          </Button>
        </div>
      ) : (
        <>
          <div className="glass-card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent-training/10 text-accent-training shrink-0">
                <ClipboardList size={22} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-panel-title truncate">{plan.name}</span>
                {plan.description && (
                  <span className="text-caption truncate">{plan.description}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setIsPlanFormOpen(true)} className={iconActionClass}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => setPlanToDelete(plan.id)} className={deleteActionClass}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Аналіз тижневого об'єму (Науковий підхід) */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <button
              onClick={() => setShowVolumeAnalysis(!showVolumeAnalysis)}
              className="w-full flex items-center justify-between gap-3 text-left focus:outline-none select-none cursor-pointer outline-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-training/10 text-accent-training">
                  <Activity size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-panel-title">Аналіз тижневого об'єму навантаження</span>
                  <span className="text-[11px] text-zinc-400 font-normal">
                    Розрахунок робочих підходів на тиждень за групами м'язів
                  </span>
                </div>
              </div>
              <div className="text-zinc-500 hover:text-zinc-300 transition-colors">
                {showVolumeAnalysis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {showVolumeAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-white/[0.06] animate-fade-up">
                {/* Стовпчик 1 і 2: М'язові групи */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  {calculateWeeklyVolume(plan.days).length === 0 ? (
                    <p className="text-caption text-zinc-500 italic py-2">
                      Додайте вправи до тренувальних днів, щоб побачити аналіз об'єму.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {calculateWeeklyVolume(plan.days).map(({ muscle, sets }) => {
                        const status = getVolumeStatus(sets);
                        const percentage = Math.min((sets / 25) * 100, 100);
                        return (
                          <div key={muscle} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[13px]">
                              <span className="font-semibold text-zinc-200">{muscle}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-zinc-400 text-xs">
                                  {sets} {sets === 1 ? "підхід" : sets >= 2 && sets <= 4 ? "підходи" : "підходів"}/тиждень
                                </span>
                                <span className={`text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${status.colorClass}`}>
                                  {status.label}
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className={`h-full ${status.barColor} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Стовпчик 3: Наукова довідка */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-3 text-[13px]">
                  <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-accent-training flex items-center gap-1.5 border-b border-white/[0.04] pb-1.5">
                    <Info size={13} />
                    Наукові рекомендації
                  </h3>
                  <div className="flex flex-col gap-2.5 text-zinc-300 leading-relaxed font-normal">
                    <div>
                      <span className="font-semibold text-zinc-200">Низький (Підтримка) (&lt; 6 підходів):</span>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Об'єм підтримки (Maintenance Volume - MV). Достатній для збереження форми при обмеженому часі.
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-200">Оптимальний (6 - 20 підходів):</span>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Зона активного росту (MEV/MAV). Золотий стандарт для збільшення сили та гіпертрофії м'язів.
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-200">Надмірний (20+ підходів):</span>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Зона ризику (MRV). Може призвести до перевантаження ЦНС і суглобів, потребує періодичного делоаду.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <SectionHeader icon={Dumbbell} label="Training days">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedDay(null);
                  setDayFormOpen(true);
                }}
              >
                <Plus size={14} />
                New day
              </Button>
            </SectionHeader>

            {plan.days.length === 0 ? (
              <div className="glass-card p-6 flex flex-col items-center gap-1 text-center">
                <p className="text-caption">No training days yet.</p>
                <p className="text-caption">Add a day to start prescribing exercises.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {plan.days.map((day) => {
                  const isDayExpanded = expandedDays.has(day.id);
                  const isTrainingToday = weekAssignments[today] === day.id;
                  const dayCardClass = `glass-card p-4 flex flex-col gap-3 border ${
                    isTrainingToday ? "border-accent-training/40" : "border-white/[0.06]"
                  }`;

                  return (
                    <div key={day.id} className={dayCardClass}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <button
                          onClick={() => toggleDay(day.id)}
                          className="flex items-center gap-3 min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-zinc-400 shrink-0">
                            <Dumbbell size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-zinc-100 truncate">
                                {day.name}
                              </span>
                              {isTrainingToday && (
                                <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-accent-training/15 text-accent-training shrink-0">
                                  Today
                                </span>
                              )}
                            </span>
                            <span className="text-caption truncate">
                              {day.exercises.length}{" "}
                              {day.exercises.length === 1 ? "exercise" : "exercises"}
                              {day.notes ? ` · ${day.notes}` : ""}
                            </span>
                          </div>
                          {isDayExpanded ? (
                            <ChevronUp size={14} className="text-zinc-500 shrink-0" />
                          ) : (
                            <ChevronDown size={14} className="text-zinc-500 shrink-0" />
                          )}
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
                              setSelectedDay(day);
                              setDayFormOpen(true);
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

                      <div className="flex items-center gap-2 pl-12">
                        <span className="text-label">Weekdays</span>
                        <WeekdayAssignmentRow
                          dayId={day.id}
                          assignments={weekAssignments}
                          onToggle={handleToggleWeekday}
                        />
                      </div>

                      {isDayExpanded && (
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
                          {day.exercises.length === 0 ? (
                            <p className="text-caption py-1">No exercises prescribed yet.</p>
                          ) : (
                            day.exercises.map((de) => (
                              <div
                                key={de.id}
                                className="flex items-center justify-between gap-2 py-1.5"
                              >
                                <div className="flex flex-col min-w-0 gap-1">
                                  <Link
                                    href={`/health/training/exercises/${de.exerciseId}`}
                                    className="text-sm text-zinc-200 hover:text-accent-training transition-colors duration-150 truncate"
                                  >
                                    {de.exercise.name}
                                  </Link>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={badgeClass}>{formatPrescription(de)}</span>
                                    {de.targetRpe ? (
                                      <span className={badgeClass}>RPE {de.targetRpe}</span>
                                    ) : null}
                                    {de.restSeconds ? (
                                      <span className={badgeClass}>rest {de.restSeconds}s</span>
                                    ) : null}
                                  </div>
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
              </div>
            )}
          </div>
        </>
      )}

      <TrainingPlanFormDialog
        key={`plan-form-${plan?.id ?? "new"}`}
        isOpen={isPlanFormOpen}
        onClose={() => setIsPlanFormOpen(false)}
        plan={plan}
      />
      {plan && (
        <TrainingDayFormDialog
          key={`day-form-${selectedDay?.id ?? "new"}`}
          isOpen={dayFormOpen}
          onClose={() => {
            setDayFormOpen(false);
            setSelectedDay(null);
          }}
          planId={plan.id}
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
