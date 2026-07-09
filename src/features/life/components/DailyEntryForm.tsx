"use client";

import { useRef, useState, useTransition, useCallback, lazy, Suspense } from "react";
import { CheckCircle2, Clock, Loader2, AlertCircle, Weight, Zap, Plus } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { SleepSection } from "./sections/SleepSection";
import { EnergySection } from "./sections/EnergySection";
import { EmotionsSection } from "./sections/EmotionsSection";
import { NutritionSection } from "./sections/NutritionSection";
import { ReflectionSection } from "./sections/ReflectionSection";
import { TaskReviewSection } from "./sections/TaskReviewSection";
import { StandupSection } from "./sections/StandupSection";
import { ConfidenceSection } from "./sections/ConfidenceSection";
import {
  upsertEntryAction,
  setDayStartedAction,
  setDayCompletedAction,
} from "../actions/journal-actions";
import { TaskGrid } from "./tasks/TaskGrid";
import { TaskFormDialog } from "./tasks/TaskFormDialog";
import { HabitCard } from "./habits/HabitCard";
import { DayGreeting } from "./DayGreeting";
import { DayComplete } from "./DayComplete";
import type {
  DailyEntryData,
  UpsertDailyEntryInput,
  TaskData,
  LifeSphereData,
  HabitData,
  ConfidenceLog,
} from "../types";
import type { RoutineMap } from "@/lib/life/routine-items";
import { Tabs } from "@/components/ui/navigation/tabs";
import { Sparkles as SparklesIcon } from "lucide-react";

const RoutineSection = lazy(() =>
  import("./sections/RoutineSection").then((m) => ({ default: m.RoutineSection })),
);
const TaskCalendar = lazy(() =>
  import("./tasks/TaskCalendar").then((m) => ({ default: m.TaskCalendar })),
);

interface Props {
  initialEntry: DailyEntryData | null;
  todayStr: string;
  isPast: boolean;
  yesterdayBrainDump: string | null;
  yesterdayStandupPlan: string | null;
  yesterdayCompletedTasks: string[];
  tasks: TaskData[];
  allTasks: TaskData[];
  spheres: LifeSphereData[];
  habits: HabitData[];
  scheduledTrainingDayName?: string;
}

const EVENING_ENERGY_LABELS = [
  "",
  "Drained",
  "Tired",
  "Okay",
  "Low",
  "Meh",
  "Fine",
  "Good",
  "Solid",
  "Peak",
  "Ultra",
];

export function DailyEntryForm({
  initialEntry,
  todayStr,
  isPast,
  yesterdayBrainDump,
  yesterdayStandupPlan,
  yesterdayCompletedTasks,
  tasks,
  allTasks,
  spheres,
  habits,
  scheduledTrainingDayName,
}: Props) {
  const [activeTab, setActiveTab] = useState("morning");
  const [taskView, setTaskView] = useState<"grid" | "timeline">("grid");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask] = useState<TaskData | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isCompletePending, startCompletePending] = useTransition();

  const initDayView = (): "greeting" | "form" | "complete" => {
    if (isPast) return "form";
    if (!initialEntry?.startedAt) return "greeting";
    if (initialEntry.completedAt) return "complete";
    return "form";
  };
  const [dayView, setDayView] = useState<"greeting" | "form" | "complete">(initDayView);

  const handleStartDay = async () => {
    const result = await setDayStartedAction(todayStr);
    if (result.success) setDayView("form");
  };

  const handleCompleteDay = () => {
    startCompletePending(async () => {
      const result = await setDayCompletedAction(todayStr);
      if (result.success) setDayView("complete");
    });
  };

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeInitialData = useCallback(() => {
    return {
      sleepBedtime: initialEntry?.sleepBedtime
        ? new Date(initialEntry.sleepBedtime).toISOString()
        : null,
      sleepWakeup: initialEntry?.sleepWakeup
        ? new Date(initialEntry.sleepWakeup).toISOString()
        : null,
      sleepHours: initialEntry?.sleepHours ?? null,
      sleepQuality: initialEntry?.sleepQuality ?? null,
      sleepNote: initialEntry?.sleepNote ?? null,
      energy: initialEntry?.energy ?? null,
      mood: initialEntry?.mood ?? null,
      emotions: (initialEntry?.emotions as string[] | null) ?? null,
      weight: initialEntry?.weight ?? null,
      energyNote: initialEntry?.energyNote ?? null,
      eveningEnergy: initialEntry?.eveningEnergy ?? null,
      nutrition: initialEntry?.nutrition ?? null,
      nutritionNote: initialEntry?.nutritionNote ?? null,
      morningRoutine: (initialEntry?.morningRoutine as RoutineMap | null) ?? null,
      eveningRoutine: (initialEntry?.eveningRoutine as RoutineMap | null) ?? null,
      routineNote: initialEntry?.routineNote ?? null,
      trainingDayName: initialEntry?.trainingDayName ?? scheduledTrainingDayName ?? null,
      winToday: initialEntry?.winToday ?? null,
      improveTomorrow: initialEntry?.improveTomorrow ?? null,
      gratitude: initialEntry?.gratitude ?? null,
      brainDump: initialEntry?.brainDump ?? null,
      standupDone: initialEntry?.standupDone ?? null,
      standupPlan: initialEntry?.standupPlan ?? null,
      standupBlockers: initialEntry?.standupBlockers ?? null,
      confidenceLog: (initialEntry?.confidenceLog as ConfidenceLog | null) ?? null,
    };
  }, [initialEntry, scheduledTrainingDayName]);

  const [savedAt, setSavedAt] = useState<Date | null>(
    initialEntry ? new Date(initialEntry.updatedAt ?? new Date()) : null,
  );
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<Omit<UpsertDailyEntryInput, "date">>(computeInitialData);

  const isToday = todayStr === new Date().toISOString().slice(0, 10);
  const isEditable = isToday || !initialEntry?.completedAt;

  const patch = (update: Partial<typeof data>) => {
    if (!isEditable) return;
    const next = { ...data, ...update };
    setData(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await upsertEntryAction({ date: todayStr, ...next });
        if (result.success) setSavedAt(new Date());
      });
    }, 1500);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setParentTask(null);
    setIsDuplicate(false);
    setTaskDialogOpen(true);
  };

  const handleAddChild = (parent: TaskData) => {
    setEditingTask(null);
    setParentTask(parent);
    setIsDuplicate(false);
    setTaskDialogOpen(true);
  };

  const handleEdit = (task: TaskData) => {
    setEditingTask(task);
    setParentTask(null);
    setIsDuplicate(false);
    setTaskDialogOpen(true);
  };

  const handleDuplicate = (task: TaskData) => {
    setEditingTask(task);
    setParentTask(null);
    setIsDuplicate(true);
    setTaskDialogOpen(true);
  };

  const dateLabel = new Date(todayStr).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const todayISO = todayStr;
  const tasksDone = tasks.filter((t) => t.status === "DONE").length;
  const habitsDone = habits.filter((h) =>
    h.completions.some((c) => new Date(c.date).toISOString().slice(0, 10) === todayISO),
  ).length;

  const suspenseFallback = (
    <div className="flex items-center justify-center py-10">
      <Loader2 size={20} className="animate-spin text-accent" />
    </div>
  );
  const calendarSuspenseFallback = (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );

  if (dayView === "greeting") {
    return (
      <DayGreeting
        dateStr={todayStr}
        yesterdayBrainDump={yesterdayBrainDump}
        onStart={handleStartDay}
      />
    );
  }

  if (dayView === "complete") {
    return (
      <DayComplete
        dateStr={todayStr}
        stats={{
          tasksTotal: tasks.length,
          tasksDone,
          habitsTotal: habits.length,
          habitsDone,
          sleepHours: data.sleepHours ?? null,
          sleepQuality: data.sleepQuality ?? null,
          energy: data.energy ?? null,
          eveningEnergy: data.eveningEnergy ?? null,
          mood: data.mood ?? null,
          winToday: data.winToday ?? null,
        }}
        onViewJournal={() => setDayView("form")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!isEditable ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-xs">
          <AlertCircle size={14} />
          Past entries are read-only.
        </div>
      ) : isPast ? (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-accent/10 border border-accent/25 text-xs text-zinc-200">
          <AlertCircle size={14} className="text-accent shrink-0" />
          <span>
            Ви заповнюєте вчорашній день retrospectively. Після натискання &quot;Завершити день&quot; він стане доступним лише для читання.
          </span>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-caption">
          <Clock size={14} />
          <span>{dateLabel}</span>
        </div>

        <div className="flex items-center gap-1.5 text-caption">
          {isPending ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Saving...
            </>
          ) : savedAt ? (
            <>
              <CheckCircle2 size={12} className="text-emerald-400" /> Saved at{" "}
              {savedAt.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </>
          ) : null}
        </div>
      </div>

      <Tabs
        tabs={[
          {
            id: "morning",
            label: "Morning",
            content: (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SleepSection
                    bedtime={data.sleepBedtime ?? null}
                    wakeup={data.sleepWakeup ?? null}
                    hours={data.sleepHours ?? null}
                    quality={data.sleepQuality ?? null}
                    note={data.sleepNote ?? null}
                    onChange={patch}
                  />
                  <EnergySection
                    energy={data.energy ?? null}
                    mood={data.mood ?? null}
                    note={data.energyNote ?? null}
                    onChange={patch}
                  />
                </div>

                <div className="glass-card p-4 flex items-center gap-3">
                  <span className="text-label shrink-0">Body</span>
                  <Weight size={12} className="text-zinc-500 shrink-0" />
                  <span className="text-sm text-zinc-300 shrink-0">Weight</span>
                  <Input
                    type="number"
                    step="0.1"
                    value={data.weight ?? ""}
                    onChange={(e) =>
                      patch({ weight: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    placeholder="0.0 kg"
                    className="max-w-[120px]"
                  />
                </div>

                <EmotionsSection emotions={data.emotions ?? null} onChange={patch} />

                <div className="glass-card p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-label">Daily Scrum Standup</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  <StandupSection
                    done={data.standupDone ?? null}
                    plan={data.standupPlan ?? null}
                    blockers={data.standupBlockers ?? null}
                    yesterdayPlan={yesterdayStandupPlan}
                    yesterdayCompletedTasks={yesterdayCompletedTasks}
                    onChange={patch}
                  />
                </div>

                <Suspense fallback={suspenseFallback}>
                  <RoutineSection
                    type="morning"
                    routine={data.morningRoutine ?? null}
                    scheduledTrainingDayName={scheduledTrainingDayName}
                    onChange={patch}
                  />
                </Suspense>
              </div>
            ),
          },
          {
            id: "habits",
            label: `Habits (${habits.length})`,
            content: (
              <div>
                {habits.length === 0 ? (
                  <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent">
                      <SparklesIcon size={32} />
                    </div>
                    <p className="text-panel-title">No habits defined</p>
                    <p className="text-caption max-w-sm">
                      Configure your habits in the Habit Tracker to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {habits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        date={new Date(todayStr)}
                        readOnly={!isEditable}
                      />
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            id: "tasks",
            label: `Tasks (${tasks.filter((t) => t.status === "DONE").length}/${tasks.length})`,
            content: (
              <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"
                  >
                    <Plus size={13} />
                    Add Task
                  </button>
                </div>
                <Tabs
                  tabs={[
                    {
                      id: "grid",
                      label: "Grid",
                      content: (
                        <TaskGrid
                          tasks={tasks}
                          onEdit={handleEdit}
                          onDuplicate={handleDuplicate}
                          onAddChild={handleAddChild}
                          allTasks={tasks}
                        />
                      ),
                    },
                    {
                      id: "timeline",
                      label: "Timeline",
                      content: (
                        <Suspense fallback={calendarSuspenseFallback}>
                          <TaskCalendar
                            tasks={tasks}
                            allTasks={tasks}
                            spheres={spheres}
                            defaultMode="day"
                            hideControls
                            onDuplicate={handleDuplicate}
                            onDelete={() => {}}
                          />
                        </Suspense>
                      ),
                    },
                  ]}
                  activeTab={taskView}
                  onTabChange={(id) => setTaskView(id as "grid" | "timeline")}
                  layoutId="taskView"
                />
              </div>
            ),
          },
          {
            id: "evening",
            label: "Evening",
            content: (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <NutritionSection
                    nutrition={data.nutrition ?? null}
                    note={data.nutritionNote ?? null}
                    onChange={patch}
                  />
                  <div className="glass-card p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400">
                          <Zap size={14} />
                        </div>
                        <h3 className="text-panel-title">Evening Energy</h3>
                      </div>
                      {data.eveningEnergy !== null && (
                        <span className="text-caption">
                          {EVENING_ENERGY_LABELS[data.eveningEnergy!]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => {
                        const isActive = data.eveningEnergy === value;
                        const levelClass = `h-8 flex-1 rounded-lg text-xs font-mono font-semibold transition-colors duration-150 ${
                          isActive
                            ? "bg-accent text-white"
                            : "bg-white/[0.03] text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                        }`;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              patch({ eveningEnergy: data.eveningEnergy === value ? null : value })
                            }
                            className={levelClass}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Suspense fallback={suspenseFallback}>
                  <RoutineSection
                    type="evening"
                    routine={data.eveningRoutine ?? null}
                    scheduledTrainingDayName={scheduledTrainingDayName}
                    onChange={patch}
                  />
                </Suspense>

                <ConfidenceSection
                  log={data.confidenceLog ?? null}
                  onChange={patch}
                />

                <TaskReviewSection tasks={tasks} date={todayStr} />

                <Suspense fallback={suspenseFallback}>
                  <TaskCalendar
                    tasks={allTasks.filter((t) => t.status !== "DONE")}
                    allTasks={allTasks}
                    spheres={spheres}
                    defaultMode="week"
                    hideModeSwitch
                    onDuplicate={handleDuplicate}
                    onDelete={() => {}}
                    minCellHeight={150}
                  />
                </Suspense>

                <ReflectionSection
                  winToday={data.winToday ?? null}
                  improveTomorrow={data.improveTomorrow ?? null}
                  gratitude={data.gratitude ?? null}
                  brainDump={data.brainDump ?? null}
                  onChange={patch}
                />

                {isEditable && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleCompleteDay}
                      disabled={isCompletePending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isCompletePending ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <span>🌙</span>
                      )}
                      Завершити день
                    </button>
                  </div>
                )}
              </div>
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        size="text-caption"
      />

      <TaskFormDialog
        key={`task-form-${editingTask?.id ?? "new"}`}
        isOpen={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        task={editingTask}
        parentTask={parentTask}
        spheres={spheres}
        allTasks={tasks}
        isDuplicate={isDuplicate}
      />
    </div>
  );
}
