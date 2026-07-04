"use client";

import { useRef, useState, useTransition, useCallback, lazy, Suspense } from "react";
import { CheckCircle2, Clock, Loader2, AlertCircle, Weight, Zap } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { SleepSection } from "./sections/SleepSection";
import { EnergySection } from "./sections/EnergySection";
import { EmotionsSection } from "./sections/EmotionsSection";
import { NutritionSection } from "./sections/NutritionSection";
import { ReflectionSection } from "./sections/ReflectionSection";
import { TaskReviewSection } from "./sections/TaskReviewSection";
import { StandupSection } from "./sections/StandupSection";
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
  DayType,
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
  scheduledDayType?: DayType;
}

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
  scheduledDayType,
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
      winToday: initialEntry?.winToday ?? null,
      improveTomorrow: initialEntry?.improveTomorrow ?? null,
      gratitude: initialEntry?.gratitude ?? null,
      brainDump: initialEntry?.brainDump ?? null,
      standupDone: initialEntry?.standupDone ?? null,
      standupPlan: initialEntry?.standupPlan ?? null,
      standupBlockers: initialEntry?.standupBlockers ?? null,
    };
  }, [initialEntry]);

  const [savedAt, setSavedAt] = useState<Date | null>(
    initialEntry ? new Date(initialEntry.updatedAt ?? new Date()) : null,
  );
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<Omit<UpsertDailyEntryInput, "date">>(computeInitialData);

  const patch = (update: Partial<typeof data>) => {
    if (!isToday) return;
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

  const isToday = todayStr === new Date().toISOString().slice(0, 10);

  const todayISO = todayStr;
  const tasksDone = tasks.filter((t) => t.status === "DONE").length;
  const habitsDone = habits.filter((h) =>
    h.completions.some((c) => new Date(c.date).toISOString().slice(0, 10) === todayISO),
  ).length;

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
    <div >
      {!isToday && (
        <div >
          <AlertCircle size={14} />
          Past entries are read-only.
        </div>
      )}
      {}
      <div >
        <div >
          <Clock size={14} />
          <span>{dateLabel}</span>
        </div>

        <div >
          {isPending ? (
            <>
              <Loader2 size={12} /> Saving...
            </>
          ) : savedAt ? (
            <>
              <CheckCircle2 size={12} /> Saved at{" "}
              {savedAt.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </>
          ) : null}
        </div>
      </div>

      <div >
        <Tabs
          tabs={[
            {
              id: "morning",
              label: "Morning",
              content: (
                <div >
                  {}
                  <div >
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

                  {}
                  <div >
                    <span >
                      Body
                    </span>
                    <div >
                      <Weight size={12} />
                      <span >
                        Weight
                      </span>
                      <Input
                        type="number"
                        step="0.1"
                        value={data.weight ?? ""}
                        onChange={(e) =>
                          patch({ weight: e.target.value ? parseFloat(e.target.value) : null })
                        }
                        placeholder="0.0 kg"

                      />
                    </div>
                  </div>

                  <EmotionsSection emotions={data.emotions ?? null} onChange={patch} />

                  <div >
                    <div >
                      <div />
                      <span >
                        Daily Scrum Standup
                      </span>
                      <div />
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

                  {}
                  <div >
                    <Suspense
                      fallback={
                        <div >
                          <Loader2 size={20} />
                        </div>
                      }
                    >
                      <RoutineSection
                        type="morning"
                        routine={data.morningRoutine ?? null}
                        scheduledDayType={scheduledDayType}
                        onChange={patch}
                      />
                    </Suspense>
                  </div>
                </div>
              ),
            },
            {
              id: "habits",
              label: `Habits (${habits.length})`,
              content: (
                <div >
                  {habits.length === 0 ? (
                    <div >
                      <div >
                        <SparklesIcon size={32} />
                      </div>
                      <p >No habits defined</p>
                      <p >
                        Configure your habits in the Habit Tracker to see them here.
                      </p>
                    </div>
                  ) : (
                    <div >
                      {habits.map((habit) => (
                        <HabitCard key={habit.id} habit={habit} date={new Date(todayStr)} />
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
                <div >
                  <div >
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
                            <Suspense
                              fallback={
                                <div >
                                  <Loader2 size={24} />
                                </div>
                              }
                            >
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
                </div>
              ),
            },
            {
              id: "evening",
              label: "Evening",
              content: (
                <div >
                  <div >
                    {}
                    <div >
                      <NutritionSection
                        nutrition={data.nutrition ?? null}
                        note={data.nutritionNote ?? null}
                        onChange={patch}
                      />
                      <div

                      >
                        <div >
                          <div >
                            <div

                            >
                              <Zap size={14} />
                            </div>
                            <h3

                            >
                              Evening Energy
                            </h3>
                          </div>
                          {data.eveningEnergy !== null && (
                            <span >
                              {
                                [
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
                                ][data.eveningEnergy!]
                              }
                            </span>
                          )}
                        </div>
                        <div >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                patch({
                                  eveningEnergy: data.eveningEnergy === value ? null : value,
                                })
                              }

                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {}
                    <Suspense
                      fallback={
                        <div >
                          <Loader2 size={20} />
                        </div>
                      }
                    >
                      <RoutineSection
                        type="evening"
                        routine={data.eveningRoutine ?? null}
                        scheduledDayType={scheduledDayType}
                        onChange={patch}
                      />
                    </Suspense>
                  </div>

                  <TaskReviewSection tasks={tasks} date={todayStr} />

                  <Suspense
                    fallback={
                      <div >
                        <Loader2 size={20} />
                      </div>
                    }
                  >
                    <TaskCalendar
                      tasks={allTasks.filter((t) => t.status !== "DONE")}
                      allTasks={allTasks}
                      spheres={spheres}
                      defaultMode="week"
                      hideModeSwitch
                      onDuplicate={handleDuplicate}
                      onDelete={() => {}}
                    />
                  </Suspense>

                  <ReflectionSection
                    winToday={data.winToday ?? null}
                    improveTomorrow={data.improveTomorrow ?? null}
                    gratitude={data.gratitude ?? null}
                    brainDump={data.brainDump ?? null}
                    onChange={patch}
                  />

                  {isToday && (
                    <div >
                      <button
                        type="button"
                        onClick={handleCompleteDay}
                        disabled={isCompletePending}

                      >
                        {isCompletePending ? (
                          <Loader2 size={13} />
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
      </div>

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
