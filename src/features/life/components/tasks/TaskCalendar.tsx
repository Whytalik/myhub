"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
  isToday
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus
} from "lucide-react";
import { 
  DndContext, 
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TaskData, LifeSphereData, TaskPriority } from "@/features/life/types";
import { updateTaskDateAction } from "@/features/life/actions/task-actions";
import { toast } from "sonner";
import { TaskFormDialog } from "./TaskFormDialog";
import { Tabs } from "@/components/ui/tabs";
import { TaskCardBase } from "./TaskCardBase";

interface TaskCalendarProps {
  tasks: TaskData[];
  allTasks?: TaskData[];
  spheres: LifeSphereData[];
  defaultMode?: "month" | "week";
  onDuplicate?: (task: TaskData) => void;
  onDelete?: () => void;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 3,
  HIGH:   2,
  MEDIUM: 1,
  LOW:    0,
};

const STATUS_SORT_ORDER: Record<string, number> = {
  IN_PROGRESS: 0,
  TODO:        1,
  BACKLOG:     2,
  DONE:        3,
  CANCELLED:   4,
};

function sortTasks(tasks: TaskData[]): TaskData[] {
  return [...tasks].sort((a, b) => {
    // 1. Sort by Status
    const sA = STATUS_SORT_ORDER[a.status] ?? 99;
    const sB = STATUS_SORT_ORDER[b.status] ?? 99;
    if (sA !== sB) return sA - sB;

    // 2. Sort by Priority (desc)
    const pA = PRIORITY_ORDER[a.priority] ?? 0;
    const pB = PRIORITY_ORDER[b.priority] ?? 0;
    if (pA !== pB) return pB - pA;

    // 3. Sort by plannedDate (asc)
    const timeA = a.plannedDate ? new Date(a.plannedDate).getTime() : Infinity;
    const timeB = b.plannedDate ? new Date(b.plannedDate).getTime() : Infinity;
    if (timeA !== timeB) return timeA - timeB;

    // 4. Fallback to manually set order (asc)
    if (a.order !== b.order) return a.order - b.order;

    // 5. Fallback to creation date (asc)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// ─── Draggable Wrapper ───────────────────────────────────────────────────────

function DraggableTask({ 
  task, 
  onEdit, 
  onDuplicate, 
  onAddChild,
  onDelete,
  allTasks 
}: { 
  task: TaskData, 
  onEdit: (t: TaskData) => void, 
  onDuplicate?: (t: TaskData) => void,
  onAddChild?: (t: TaskData) => void,
  onDelete?: () => void,
  allTasks: TaskData[] 
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
    position: 'relative' as const,
    transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
    willChange: isDragging ? 'transform' : 'auto',
  };

  return (
    <TaskCardBase
      task={task}
      variant="compact"
      isDragging={isDragging}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      style={style}
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      onAddChild={onAddChild}
      onDelete={onDelete}
      allTasks={allTasks}
    />
  );
}

// ─── Spanning Milestone (Parent Task across date range) ──────────────────────

function SpanningMilestone({
  task,
  day,
  onEdit,
  onAddChild,
}: {
  task: TaskData,
  day: Date,
  onEdit: (t: TaskData) => void,
  onAddChild?: (t: TaskData) => void,
}) {
  const completedSubtasks = task.children.filter(c => c.status === 'DONE').length;
  const totalSubtasks = task.children.length;
  const pct = Math.round((completedSubtasks / totalSubtasks) * 100);
  const isDone = task.status === 'DONE' || task.status === 'CANCELLED';

  const allDates: Date[] = [];
  task.children.forEach(child => {
    if (child.plannedDate) allDates.push(new Date(child.plannedDate));
  });
  if (task.dueDate) allDates.push(new Date(task.dueDate));

  const isSingleDay = allDates.length <= 1;
  let isRangeStart = true;
  let isRangeEnd = true;

  if (!isSingleDay) {
    const rangeStart = new Date(Math.min(...allDates.map(d => d.getTime())));
    const rangeEnd = new Date(Math.max(...allDates.map(d => d.getTime())));
    isRangeStart = format(day, "yyyy-MM-dd") === format(rangeStart, "yyyy-MM-dd");
    isRangeEnd = format(day, "yyyy-MM-dd") === format(rangeEnd, "yyyy-MM-dd");
  }

  return (
    <div
      onClick={() => onEdit(task)}
      className={`
        group relative flex items-center gap-1.5 px-1.5 py-1 w-full mb-1 last:mb-0 cursor-pointer transition-all
        ${isDone
          ? 'bg-accent/5 border-accent/10 opacity-50'
          : 'bg-gradient-to-r from-accent/15 to-accent/5 border-accent/20 hover:from-accent/25 hover:to-accent/10'
        }
        border
      `}
      style={{
        borderRadius: `${isRangeStart ? '8px' : '0'} ${isRangeEnd ? '8px' : '0'} ${isRangeEnd ? '8px' : '0'} ${isRangeStart ? '8px' : '0'}`,
      }}
    >
      <span className="text-[7px] text-accent/50 shrink-0">◆</span>
      <span className={`text-[9px] font-bold truncate flex-1 ${isDone ? 'text-muted/30 line-through' : 'text-text/70'}`}>
        {task.title}
      </span>
      <span className="text-[7px] font-mono text-muted/40 tabular-nums shrink-0">{pct}%</span>
      {onAddChild && (
        <button
          onClick={(e) => { e.stopPropagation(); onAddChild(task); }}
          className="p-0.5 rounded text-muted/20 hover:text-accent transition-all opacity-0 group-hover:opacity-100"
        >
          <Plus size={8} />
        </button>
      )}
    </div>
  );
}

// ─── Spanning Task continuation bar (multi-day task) ─────────────────────────

function SpanningTask({
  task,
}: {
  task: TaskData,
}) {
  const sphereColor = task.sphere?.color || '#888';
  const isDone = task.status === 'DONE' || task.status === 'CANCELLED';

  return (
    <div
      className={`w-full mb-1 last:mb-0 transition-all ${isDone ? 'opacity-30' : 'opacity-80 hover:opacity-100'}`}
      style={{ height: '4px' }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{ backgroundColor: isDone ? 'rgba(255,255,255,0.1)' : sphereColor }}
      />
    </div>
  );
}

// ─── Droppable Cell ──────────────────────────────────────────────────────────

function CalendarDayCell({ 
  day, 
  currentMonth, 
  tasks,
  onEdit,
  onDuplicate,
  onAddChild,
  onDelete,
  onAdd,
  isDraggingAny,
  mode,
  allTasks
}: { 
  day: Date, 
  currentMonth: Date, 
  tasks: TaskData[],
  onEdit: (t: TaskData) => void,
  onDuplicate?: (t: TaskData) => void,
  onAddChild?: (t: TaskData) => void,
  onDelete?: () => void,
  onAdd?: (date: Date) => void,
  isDraggingAny: boolean,
  mode: "month" | "week",
  allTasks: TaskData[]
}) {
  const dateKey = format(day, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
  });

  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isTodayDate = isToday(day);
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`
        p-1 md:p-2 border-r border-b border-white/[0.03] transition-colors flex flex-col gap-1 group/cell
        ${mode === 'month' ? 'min-h-[100px] md:min-h-[160px]' : 'min-h-[300px] md:min-h-[400px] flex-1'}
        ${!isCurrentMonth && mode === 'month' ? "bg-bg/40 opacity-20" : isWeekend ? "bg-[#11100e]" : "bg-[#141414]"}
        ${isOver ? "bg-accent/[0.05] border-accent/20" : ""}
        ${isDraggingAny ? "overflow-visible" : "overflow-hidden"}
      `}
    >
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div className="flex flex-col">
           {mode === 'week' && (
              <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-muted/40 mb-1">
                {format(day, "EEEE")}
              </span>
           )}
           <span className={`
            text-[10px] md:text-xs font-mono font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg transition-all
            ${isTodayDate ? "bg-accent text-bg shadow-lg shadow-accent/20" : isCurrentMonth || mode === 'week' ? "text-muted" : "text-muted/30"}
          `}>
            {format(day, "d")}
          </span>
        </div>

        {onAdd && (
          <button
            onClick={() => onAdd(day)}
            className="p-1 rounded-lg text-muted/30 hover:text-accent hover:bg-accent/10 transition-all opacity-0 group-hover/cell:opacity-100"
            title="Add task to this day"
          >
            <Plus size={12} className="md:w-[14px] md:h-[14px]" />
          </button>
        )}
      </div>
      
      <div className={`flex-1 flex flex-col ${isDraggingAny ? "overflow-visible" : "overflow-y-auto scrollbar-hide"}`}>
        {sortedTasks.map(task => {
          const hasChildren = task.children.length > 0;
          const hasDateRange = !!task.plannedDate && !!task.plannedEndDate;
          const isSpanningTask = hasDateRange && format(day, "yyyy-MM-dd") !== format(new Date(task.plannedDate!), "yyyy-MM-dd");

          if (hasChildren) {
            return (
              <SpanningMilestone
                key={task.id}
                task={task}
                day={day}
                onEdit={onEdit}
                onAddChild={onAddChild}
              />
            );
          }

          if (hasDateRange) {
            if (isSpanningTask) {
              return (
                <SpanningTask
                  key={task.id}
                  task={task}
                />
              );
            }
            return (
              <div key={task.id} className="relative">
                <DraggableTask
                  task={task}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onAddChild={onAddChild}
                  onDelete={onDelete}
                  allTasks={allTasks}
                />
                <div className="absolute -bottom-1 left-2 right-2 h-1 rounded-full opacity-60" style={{ backgroundColor: task.sphere?.color || '#888' }} />
              </div>
            );
          }

          return (
            <DraggableTask
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onAddChild={onAddChild}
              onDelete={onDelete}
              allTasks={allTasks}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function TaskCalendar({ 
  tasks: initialTasks, 
  allTasks, 
  spheres, 
  defaultMode = "week", 
  onDuplicate,
  onDelete
}: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<"month" | "week">(defaultMode);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask] = useState<TaskData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [dialogVersion, setDialogVersion] = useState(0);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  
  const [localTasks, setLocalTasks] = useState<TaskData[]>(initialTasks);
  
  // Use provided allTasks or fallback to localTasks for parent resolution
  const parentResolutionTasks = allTasks || localTasks;

  const handleEdit = (t: TaskData) => {
    setEditingTask(t);
    setParentTask(null);
    setIsDuplicate(false);
    setDialogVersion(v => v + 1);
    setDialogOpen(true);
  };

  const handleDuplicate = (t: TaskData) => {
    if (onDuplicate) {
      onDuplicate(t);
    } else {
      setEditingTask(t);
      setParentTask(null);
      setIsDuplicate(true);
      setDialogVersion(v => v + 1);
      setDialogOpen(true);
    }
  };

  const handleAddChild = (parent: TaskData) => {
    setEditingTask(null);
    setParentTask(parent);
    setIsDuplicate(false);
    setDialogVersion(v => v + 1);
    setDialogOpen(true);
  };

  const handleTaskDeleted = () => {
    setDialogVersion(v => v + 1);
    setDialogOpen(false);
    setEditingTask(null);
    setParentTask(null);
    setIsDuplicate(false);
    onDelete?.();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setParentTask(null);
    setIsDuplicate(false);
  };

  useEffect(() => {
    setLocalTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const days = useMemo(() => {
    if (mode === "month") {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, mode]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, TaskData[]> = {};

    localTasks.forEach(task => {
      const hasChildren = task.children.length > 0;

      if (!hasChildren) {
        if (task.plannedDate && task.plannedEndDate) {
          const start = new Date(task.plannedDate);
          const end = new Date(task.plannedEndDate);
          const days = eachDayOfInterval({ start, end });
          days.forEach(day => {
            const key = format(day, "yyyy-MM-dd");
            if (!map[key]) map[key] = [];
            map[key].push(task);
          });
        } else {
          const displayDate = task.plannedDate || task.dueDate;
          if (displayDate) {
            const key = format(new Date(displayDate), "yyyy-MM-dd");
            if (!map[key]) map[key] = [];
            map[key].push(task);
          }
        }
      } else {
        const allDates: Date[] = [];
        task.children.forEach(child => {
          if (child.plannedDate) allDates.push(new Date(child.plannedDate));
        });
        if (task.dueDate) allDates.push(new Date(task.dueDate));
        if (allDates.length === 0) return;

        const rangeStart = new Date(Math.min(...allDates.map(d => d.getTime())));
        const rangeEnd = new Date(Math.max(...allDates.map(d => d.getTime())));
        const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
        days.forEach(day => {
          const key = format(day, "yyyy-MM-dd");
          if (!map[key]) map[key] = [];
          map[key].push(task);
        });
      }
    });

    return map;
  }, [localTasks]);

  const handleDragStart = () => {
    setIsDraggingAny(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDraggingAny(false);
    document.body.style.cursor = 'auto';

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newDateStr = over.id as string;
      
      const originalTasks = [...localTasks];
      setLocalTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const newDate = new Date(newDateStr);
          if (t.plannedDate) {
            const oldDate = new Date(t.plannedDate);
            newDate.setHours(oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());
          }
          return { ...t, plannedDate: newDate };
        }
        return t;
      }));

      try {
        await updateTaskDateAction(taskId, newDateStr);
        toast.success(`Moved to ${format(parseISO(newDateStr), "MMM d")}`);
      } catch {
        setLocalTasks(originalTasks);
        toast.error("Failed to move task");
      }
    }
  };

  const navigate = (direction: number) => {
    if (mode === "month") {
      setCurrentDate(prev => direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    } else {
      setCurrentDate(prev => direction > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1));
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col bg-[#0f0d0a] border border-[#2e2e2e] rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-700 min-w-0">
        {/* Calendar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-8 border-b border-white/[0.03] bg-white/[0.01] gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-xl">
              <CalendarIcon size={20} className="text-accent md:w-5 md:h-5 w-4 h-4" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-base md:text-lg font-black tracking-tighter text-text">
                {format(currentDate, mode === 'month' ? "MMMM yyyy" : "'Week' w, MMMM yyyy")}
              </h2>
              <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mt-0.5">
                {mode === 'month' ? 'Monthly overview' : 'Weekly focus'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6">
            <div className="flex-1 sm:flex-initial min-w-0">
              <Tabs 
                tabs={[
                  { id: "month", label: "Month" },
                  { id: "week", label: "Week" }
                ]} 
                activeTab={mode} 
                onTabChange={(id) => setMode(id as "month" | "week")} 
              />
            </div>

            <div className="hidden sm:block h-8 w-px bg-border/40" />

            <div className="flex items-center justify-between sm:justify-start gap-2">
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 md:px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted hover:text-text transition-all"
              >
                Today
              </button>
              <div className="flex gap-1 md:gap-2">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 md:p-2.5 hover:bg-white/[0.07] rounded-xl text-muted hover:text-text transition-all border border-white/[0.05]"
                >
                  <ChevronLeft size={18} className="md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={() => navigate(1)}
                  className="p-2 md:p-2.5 hover:bg-white/[0.07] rounded-xl text-muted hover:text-text transition-all border border-white/[0.05]"
                >
                  <ChevronRight size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[600px] md:min-w-0">
            <div className="grid grid-cols-7 border-b border-white/[0.03] bg-white/[0.01]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                <div key={day} className={`py-3 md:py-5 text-center text-[8px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] ${i >= 5 ? "text-amber-500/30" : "text-muted/20"}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className={`grid grid-cols-7 border-l border-t border-white/[0.03] ${mode === 'week' ? 'flex-1' : ''}`}>
              {days.map((day, i) => (
                <CalendarDayCell 
                  key={i} 
                  day={day} 
                  currentMonth={currentDate} 
                  tasks={tasksByDay[format(day, "yyyy-MM-dd")] || []}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onAddChild={handleAddChild}
                  onDelete={handleTaskDeleted}
                  onAdd={(date) => {
                    setEditingTask({ plannedDate: date } as TaskData);
                    setParentTask(null);
                    setIsDuplicate(false);
                    setDialogVersion(v => v + 1);
                    setDialogOpen(true);
                  }}
                  isDraggingAny={isDraggingAny}
                  mode={mode}
                  allTasks={parentResolutionTasks}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <TaskFormDialog
        key={`task-form-${dialogVersion}-${editingTask?.id ?? 'new'}`}
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        task={editingTask}
        parentTask={parentTask}
        spheres={spheres}
        allTasks={parentResolutionTasks}
        onViewTask={(t) => setEditingTask(t)}
        isDuplicate={isDuplicate}
      />
    </DndContext>
  );
}
