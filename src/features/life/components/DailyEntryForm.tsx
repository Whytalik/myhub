"use client";

import { useRef, useState, useTransition, useCallback, lazy, Suspense } from "react";
import { CheckCircle2, Clock, Loader2, AlertCircle, Weight, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SleepSection } from "./sections/SleepSection";
import { EnergySection } from "./sections/EnergySection";
import { EmotionsSection } from "./sections/EmotionsSection";
import { NutritionSection } from "./sections/NutritionSection";
import { ReflectionSection } from "./sections/ReflectionSection";
import { TaskReviewSection } from "./sections/TaskReviewSection";
import { StandupSection } from "./sections/StandupSection";
import { upsertEntryAction } from "../actions/journal-actions";
import { TaskGrid } from "./tasks/TaskGrid";
import { TaskFormDialog } from "./tasks/TaskFormDialog";
import { HabitCard } from "./habits/HabitCard";
import type { DailyEntryData, UpsertDailyEntryInput, TaskData, LifeSphereData, HabitData, DayType } from "../types";
import { dayTypeToRoutine } from "../types";
import type { RoutineMap } from "@/lib/routine-items";
import { Tabs } from "@/components/ui/tabs";
import { Sparkles as SparklesIcon } from "lucide-react";

const RoutineSection = lazy(() => import("./sections/RoutineSection").then(m => ({ default: m.RoutineSection })));
const TaskCalendar = lazy(() => import("./tasks/TaskCalendar").then(m => ({ default: m.TaskCalendar })));

interface Props {
  initialEntry: DailyEntryData | null;
  todayStr: string; // "YYYY-MM-DD"
  tasks: TaskData[];
  allTasks: TaskData[];
  spheres: LifeSphereData[];
  habits: HabitData[];
  scheduledDayType?: DayType;
}

export function DailyEntryForm({ initialEntry, todayStr, tasks, allTasks, spheres, habits, scheduledDayType }: Props) {
  const [activeTab, setActiveTab] = useState("morning");
  const [taskView, setTaskView] = useState<"grid" | "timeline">("grid");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask]   = useState<TaskData | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeInitialData = useCallback(() => {
    const scheduled = scheduledDayType ? dayTypeToRoutine(scheduledDayType) : null;

    let morningRoutine = (initialEntry?.morningRoutine as RoutineMap | null) ?? null;

    if (morningRoutine && morningRoutine["_isTrainingDay"] === undefined) {
      const isTrainDay = scheduled ? scheduled.isTrainingDay : [1, 3, 5].includes(new Date(todayStr).getDay());
      morningRoutine = { ...morningRoutine, _isTrainingDay: isTrainDay };
      return {
        sleepBedtime:    initialEntry?.sleepBedtime ? new Date(initialEntry.sleepBedtime).toISOString() : null,
        sleepWakeup:     initialEntry?.sleepWakeup ? new Date(initialEntry.sleepWakeup).toISOString() : null,
        sleepHours:      initialEntry?.sleepHours ?? null,
        sleepQuality:    initialEntry?.sleepQuality ?? null,
        sleepNote:       initialEntry?.sleepNote ?? null,
        energy:          initialEntry?.energy ?? null,
        mood:            initialEntry?.mood ?? null,
        emotions:        (initialEntry?.emotions as string[] | null) ?? null,
        weight:          initialEntry?.weight ?? null,
        energyNote:      initialEntry?.energyNote ?? null,
        eveningEnergy:   initialEntry?.eveningEnergy ?? null,
        nutrition:       initialEntry?.nutrition ?? null,
        nutritionNote:   initialEntry?.nutritionNote ?? null,
        morningRoutine,
        eveningRoutine:  (initialEntry?.eveningRoutine as RoutineMap | null) ?? null,
        routineNote:     initialEntry?.routineNote ?? null,
        winToday:        initialEntry?.winToday ?? null,
        improveTomorrow: initialEntry?.improveTomorrow ?? null,
        gratitude:       initialEntry?.gratitude ?? null,
        brainDump:       initialEntry?.brainDump ?? null,
        standupDone:     initialEntry?.standupDone ?? null,
        standupPlan:     initialEntry?.standupPlan ?? null,
        standupBlockers: initialEntry?.standupBlockers ?? null,
      };
    }
    
    if (!morningRoutine) {
      const isTrainDay = scheduled ? scheduled.isTrainingDay : [1, 3, 5].includes(new Date(todayStr).getDay());

      // Default times: 22:00 and 08:00
      const defaultBedtime = new Date(todayStr);
      defaultBedtime.setHours(22, 0, 0, 0);
      const defaultWakeup = new Date(todayStr);
      defaultWakeup.setHours(8, 0, 0, 0);

      return {
        sleepBedtime:    initialEntry?.sleepBedtime ? new Date(initialEntry.sleepBedtime).toISOString() : null,
        sleepWakeup:     initialEntry?.sleepWakeup ? new Date(initialEntry.sleepWakeup).toISOString() : null,
        sleepHours:      initialEntry?.sleepHours ?? null,
        sleepQuality:    initialEntry?.sleepQuality ?? null,
        sleepNote:       initialEntry?.sleepNote ?? null,
        energy:          initialEntry?.energy ?? null,
        mood:            initialEntry?.mood ?? null,
        emotions:        (initialEntry?.emotions as string[] | null) ?? null,
        weight:          initialEntry?.weight ?? null,
        energyNote:      initialEntry?.energyNote ?? null,
        eveningEnergy:   initialEntry?.eveningEnergy ?? null,
        nutrition:       initialEntry?.nutrition ?? null,
        nutritionNote:   initialEntry?.nutritionNote ?? null,
        morningRoutine:  { _isTrainingDay: isTrainDay },
        eveningRoutine:  (initialEntry?.eveningRoutine as RoutineMap | null) ?? (scheduled ? { _eveningMode: scheduled.eveningMode } as unknown as RoutineMap : null),
        routineNote:     initialEntry?.routineNote ?? null,
        winToday:        initialEntry?.winToday ?? null,
        improveTomorrow: initialEntry?.improveTomorrow ?? null,
        gratitude:       initialEntry?.gratitude ?? null,
        brainDump:       initialEntry?.brainDump ?? null,
        standupDone:     initialEntry?.standupDone ?? null,
        standupPlan:     initialEntry?.standupPlan ?? null,
        standupBlockers: initialEntry?.standupBlockers ?? null,
      };
    }

    return {
      sleepBedtime:    initialEntry?.sleepBedtime ? new Date(initialEntry.sleepBedtime).toISOString() : null,
      sleepWakeup:     initialEntry?.sleepWakeup ? new Date(initialEntry.sleepWakeup).toISOString() : null,
      sleepHours:      initialEntry?.sleepHours ?? null,
      sleepQuality:    initialEntry?.sleepQuality ?? null,
      sleepNote:       initialEntry?.sleepNote ?? null,
      energy:          initialEntry?.energy ?? null,
      mood:            initialEntry?.mood ?? null,
      emotions:        (initialEntry?.emotions as string[] | null) ?? null,
      weight:          initialEntry?.weight ?? null,
      energyNote:      initialEntry?.energyNote ?? null,
      nutrition:       initialEntry?.nutrition ?? null,
      nutritionNote:   initialEntry?.nutritionNote ?? null,
      morningRoutine,
      eveningRoutine:  (initialEntry?.eveningRoutine as RoutineMap | null) ?? null,
      routineNote:     initialEntry?.routineNote ?? null,
      winToday:        initialEntry?.winToday ?? null,
      improveTomorrow: initialEntry?.improveTomorrow ?? null,
      gratitude:       initialEntry?.gratitude ?? null,
      brainDump:       initialEntry?.brainDump ?? null,
      standupDone:     initialEntry?.standupDone ?? null,
      standupPlan:     initialEntry?.standupPlan ?? null,
      standupBlockers: initialEntry?.standupBlockers ?? null,
    };
  }, [initialEntry, todayStr, scheduledDayType]);

  const [savedAt, setSavedAt] = useState<Date | null>(
    initialEntry ? new Date(initialEntry.updatedAt ?? new Date()) : null
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

  return (
    <div className={`flex flex-col gap-6 ${!isToday ? "pointer-events-none opacity-80" : ""}`}>
      {!isToday && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-xl text-base font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={14} />
          Past entries are read-only.
        </div>
      )}
      {/* Header Controls */}
      <div className="flex flex-row items-center justify-between gap-4 bg-surface border border-border p-3 md:p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-body md:text-subtitle font-mono text-text uppercase tracking-wider bg-raised px-4 py-2 rounded-lg border border-border/50 shrink-0">
          <Clock size={14} className="text-accent" />
          <span>{dateLabel}</span>
        </div>

        <div className="flex items-center gap-2 text-body md:text-subtitle font-mono text-text px-2 md:px-0 shrink-0">
          {isPending ? (
            <><Loader2 size={12} className="animate-spin" /> Saving...</>
          ) : savedAt ? (
            <><CheckCircle2 size={12} className="text-accent" /> Saved at {savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}</>
          ) : null}
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <Tabs 
              tabs={[
                { 
                  id: "morning", 
                  label: "Morning",
                  content: (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {/* Row 1: Sleep & Energy */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                      {/* Body Metrics */}
                      <div className="flex flex-wrap items-center gap-4 bg-surface border border-border rounded-xl px-5 py-4">
                        <span className="text-note font-mono uppercase tracking-widest text-muted mr-2">Body</span>
                        <div className="flex items-center gap-2">
                          <Weight size={12} className="text-muted" />
                          <span className="text-note font-mono uppercase tracking-wider text-muted">Weight</span>
                          <Input
                            type="number"
                            step="0.1"
                            value={data.weight ?? ""}
                            onChange={(e) => patch({ weight: e.target.value ? parseFloat(e.target.value) : null })}
                            placeholder="0.0 kg"
                            className="h-7 text-base rounded-lg px-3 w-24"
                          />
                        </div>
                      </div>

                      <EmotionsSection
                        emotions={data.emotions ?? null}
                        onChange={patch}
                      />

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 px-2">
                          <div className="h-px flex-1 bg-border/40" />
                          <span className="text-note font-mono text-muted uppercase tracking-[0.4em] whitespace-nowrap text-emerald-500">Daily Scrum Standup</span>
                          <div className="h-px flex-1 bg-border/40" />
                        </div>
                        <StandupSection
                          done={data.standupDone ?? null}
                          plan={data.standupPlan ?? null}
                          blockers={data.standupBlockers ?? null}
                          onChange={patch}
                        />
                      </div>

                      {/* Row 2: Routine */}
                      <div className="grid grid-cols-1 gap-6">
                        <Suspense fallback={<div className="bg-surface border rounded-xl p-5 h-[200px] flex items-center justify-center"><Loader2 size={20} className="text-accent animate-spin" /></div>}>
                          <RoutineSection
                            type="morning"
                            routine={data.morningRoutine ?? null}
                            scheduledDayType={scheduledDayType}
                            onChange={patch}
                          />
                        </Suspense>
                      </div>
                    </div>
                  )
                },
                { 
                  id: "habits", 
                  label: `Habits (${habits.length})`,
                  content: (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {habits.length === 0 ? (
                        <div className="bg-surface/30 border border-dashed border-border/40 rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-raised flex items-center justify-center border border-border">
                            <SparklesIcon size={32} className="text-muted/40" />
                          </div>
                          <p className="text-base font-bold text-text">No habits defined</p>
                          <p className="text-note text-muted max-w-[280px]">
                            Configure your habits in the Habit Tracker to see them here.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {habits.map((habit) => (
                            <HabitCard 
                              key={habit.id} 
                              habit={habit}
                              date={new Date(todayStr)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                },
                { 
                  id: "tasks", 
                  label: `Tasks (${tasks.length})`,
                  content: (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex justify-center">
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
                              )
                            },
                            { 
                              id: "timeline", 
                              label: "Timeline",
                              content: (
                                <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={24} className="text-accent animate-spin" /></div>}>
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
                              )
                            }
                          ]} 
                          activeTab={taskView} 
                          onTabChange={(id) => setTaskView(id as "grid" | "timeline")}
                          className="bg-raised/50"
                          layoutId="taskView"
                        />
                      </div>
                    </div>
                  )
                },
                { 
                  id: "evening", 
                  label: "Evening",
                  content: (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Column 1: Nutrition + Evening Energy */}
                        <div className="flex flex-col gap-6">
                          <NutritionSection
                            nutrition={data.nutrition ?? null}
                            note={data.nutritionNote ?? null}
                            onChange={patch}
                          />
                          <div className={`bg-surface border rounded-xl p-6 flex flex-col gap-4 transition-all ${
                            data.eveningEnergy !== null ? "border-accent/20 shadow-[0_0_15px_rgba(192,132,252,0.03)]" : "border-border"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-1.5 rounded-lg transition-colors ${data.eveningEnergy !== null ? "bg-accent text-bg" : "bg-accent-muted text-accent"}`}>
                                  <Zap size={14} />
                                </div>
                                <h3 className={`text-body font-medium transition-colors ${data.eveningEnergy !== null ? "text-accent" : "text-text"}`}>
                                  Evening Energy
                                </h3>
                              </div>
                              {data.eveningEnergy !== null && (
                                <span className="text-note font-mono text-muted uppercase tracking-wider">
                                  {["","Drained","Tired","Okay","Low","Meh","Fine","Good","Solid","Peak","Ultra"][data.eveningEnergy!]}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 h-9">
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => patch({ eveningEnergy: data.eveningEnergy === value ? null : value })}
                                  className={`flex-1 rounded-lg border text-caption font-mono transition-all ${
                                    data.eveningEnergy === value
                                      ? "bg-accent border-accent text-bg font-bold shadow-[0_0_10px_rgba(192,132,252,0.2)]"
                                      : data.eveningEnergy != null && value <= data.eveningEnergy
                                      ? "bg-accent-muted/40 border-accent/20 text-accent/60"
                                      : "bg-raised border-border text-muted hover:border-accent/40 hover:text-text"
                                  }`}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Evening Routine */}
                        <Suspense fallback={<div className="bg-surface border rounded-xl p-5 h-[200px] flex items-center justify-center"><Loader2 size={20} className="text-accent animate-spin" /></div>}>
                          <RoutineSection
                            type="evening"
                            routine={data.eveningRoutine ?? null}
                            scheduledDayType={scheduledDayType}
                            onChange={patch}
                          />
                        </Suspense>
                      </div>

                      <TaskReviewSection tasks={tasks} date={todayStr} />

                      <Suspense fallback={<div className="bg-surface border border-border rounded-xl h-[300px] flex items-center justify-center"><Loader2 size={20} className="text-accent animate-spin" /></div>}>
                        <TaskCalendar
                          tasks={allTasks.filter(t => t.status !== 'DONE')}
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
                    </div>
                  )
                }
              ]} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              className="!gap-0"
              size="text-caption"
            />
          </div>

      <TaskFormDialog
        key={`task-form-${editingTask?.id ?? 'new'}`}
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
