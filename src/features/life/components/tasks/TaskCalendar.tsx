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
  Flag,
  Clock,
  ArrowUp,
  Copy,
  Plus
} from "lucide-react";
import { 
  DndContext, 
  useDraggable, 
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TaskData, LifeSphereData, TaskPriority } from "@/features/life/types";
import { updateTaskDateAction } from "@/features/life/actions/task-actions";
import { toast } from "sonner";
import { TaskFormDialog } from "./TaskFormDialog";
import { PriorityBadge } from "./PriorityBadge";
import { STATUS_CONFIG } from "./StatusToggle";
import { Tabs } from "@/components/ui/tabs";
import { SPHERE_ICONS, ALL_ICONS } from "./lucide-icons-map";

interface TaskCalendarProps {
  tasks: TaskData[];
  allTasks?: TaskData[];
  spheres: LifeSphereData[];
  defaultMode?: "month" | "week";
  onDuplicate?: (task: TaskData) => void;
  onAdd?: (date: Date) => void;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 3,
  HIGH:   2,
  MEDIUM: 1,
  LOW:    0,
};

function sortTasks(tasks: TaskData[]): TaskData[] {
  return [...tasks].sort((a, b) => {
    // 1. Sort by plannedDate (asc)
    const timeA = a.plannedDate ? new Date(a.plannedDate).getTime() : Infinity;
    const timeB = b.plannedDate ? new Date(b.plannedDate).getTime() : Infinity;
    if (timeA !== timeB) return timeA - timeB;

    // 2. Sort by Priority (desc)
    const pA = PRIORITY_ORDER[a.priority] ?? 0;
    const pB = PRIORITY_ORDER[b.priority] ?? 0;
    if (pA !== pB) return pB - pA;

    // 3. Fallback to manually set order (asc)
    if (a.order !== b.order) return a.order - b.order;

    // 4. Fallback to creation date (asc)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// ─── Task UI Component ───────────────────────────────────────────────────────

function TaskCard({ task, isDragging = false, listeners, attributes, setNodeRef, transform, onEdit, onDuplicate, allTasks }: {
  task: TaskData,
  isDragging?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: any,
  setNodeRef?: (node: HTMLElement | null) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform?: any,
  onEdit: (t: TaskData) => void,
  onDuplicate?: (t: TaskData) => void,
  allTasks: TaskData[]
}) {
  const isDone = task.status === "DONE" || task.status === "CANCELLED";
  
  const formatDateTime = (date: Date | null, hasTime: boolean) => {
    if (!date) return null;
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (hasTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.hour12 = false;
    }
    return d.toLocaleString("en-US", options);
  };

  const plannedLabel = formatDateTime(task.plannedDate, task.hasPlannedTime);
  const dueLabel = formatDateTime(task.dueDate, task.hasDueTime);

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
    position: 'relative' as const,
    transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
    willChange: isDragging ? 'transform' : 'auto',
  };

  const handleParentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.parentId) {
      const parent = allTasks.find(t => t.id === task.parentId);
      if (parent) onEdit(parent);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative flex flex-col gap-1.5 p-2 rounded-xl border w-full cursor-grab active:cursor-grabbing mb-2 last:mb-0
        ${isDragging ? 'shadow-2xl ring-2 ring-accent border-accent bg-[#1a1a1a] z-[1000] scale-[1.02]' : 'bg-[#1a1a1a] border-[#2e2e2e] transition-all'}
        ${isDone && !isDragging ? 'opacity-50' : ''}
      `}
      onClick={() => {
        if (!transform) onEdit(task);
      }}
    >
      {/* Duplicate Button Overlay */}
      {onDuplicate && !isDragging && (
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(task); }}
          className="absolute top-1 right-1 p-1 rounded-md bg-accent/10 border border-accent/20 text-accent opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-accent/20"
          title="Duplicate task"
        >
          <Copy size={10} />
        </button>
      )}

      {task.parentId && (
        <div 
          onClick={handleParentClick}
          className="flex items-center gap-1 text-[10px] font-mono text-muted/50 leading-none truncate hover:text-accent transition-colors cursor-pointer group/parent"
        >
          <ArrowUp size={10} className="shrink-0 group-hover/parent:-translate-y-0.5 transition-transform" />
          {task.parentIcon && ALL_ICONS[task.parentIcon] && (() => {
             const PIcon = ALL_ICONS[task.parentIcon];
             return <PIcon size={10} className="shrink-0 opacity-40" />;
          })()}
          <span className="truncate underline decoration-dotted underline-offset-2">{task.parentTitle || 'Parent Task'}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1 min-w-0">
          {task.icon && SPHERE_ICONS[task.icon] ? (() => {
            const Icon = SPHERE_ICONS[task.icon];
            return <Icon size={12} className="text-accent/60 shrink-0" strokeWidth={2.5} />;
          })() : null}
          <div className={`text-xs font-bold text-text leading-tight ${isDone && !isDragging ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
           {(() => {
             const statusCfg = STATUS_CONFIG[task.status];
             const StatusIcon = statusCfg.icon;
             return (
               <div
                 className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                 style={{ backgroundColor: `${statusCfg.color}15`, borderColor: `${statusCfg.color}40`, color: statusCfg.color }}
               >
                 <StatusIcon size={8} strokeWidth={3} />
                 {statusCfg.label}
               </div>
             );
           })()}
           <PriorityBadge priority={task.priority} className="!text-[8px] !px-1.5 !py-0.5" />
           {task.sphere && (
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                style={{ backgroundColor: `${task.sphere.color}15`, borderColor: `${task.sphere.color}40`, color: task.sphere.color }}
              >
                {(() => {
                  const SphereIcon = SPHERE_ICONS[task.sphere.icon] || Flag;
                  return <SphereIcon size={8} strokeWidth={3} />;
                })()}
                {task.sphere.name}
              </div>
           )}
        </div>

        <div className="flex flex-col gap-1 pt-1.5 border-t border-white/[0.03]">
           {plannedLabel && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted leading-none">
                 <Clock size={10} className="text-accent/40" />
                 <span className="text-text font-black">{plannedLabel}</span>
              </div>
           )}
           {dueLabel && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-500/80 leading-none">
                 <Flag size={10} className="text-rose-500 fill-rose-500/10" />
                 <span className="font-black text-rose-400">{dueLabel}</span>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}

// ─── Draggable Wrapper ───────────────────────────────────────────────────────

function DraggableTask({ task, onEdit, onDuplicate, allTasks }: { task: TaskData, onEdit: (t: TaskData) => void, onDuplicate?: (t: TaskData) => void, allTasks: TaskData[] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task
  });

  return (
    <TaskCard 
      task={task} 
      isDragging={isDragging} 
      setNodeRef={setNodeRef} 
      listeners={listeners} 
      attributes={attributes} 
      transform={transform}
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      allTasks={allTasks}
    />
  );
}

// ─── Droppable Cell ──────────────────────────────────────────────────────────

function CalendarDayCell({ 
  day, 
  currentMonth, 
  tasks,
  onEdit,
  onDuplicate,
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
  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`
        p-2 border-r border-b border-white/[0.03] transition-colors flex flex-col gap-1 group/cell
        ${mode === 'month' ? 'min-h-[160px]' : 'min-h-[400px] flex-1'}
        ${!isCurrentMonth && mode === 'month' ? "bg-bg/40 opacity-20" : "bg-[#141414]"}
        ${isOver ? "bg-accent/[0.05] border-accent/20" : ""}
        ${isDraggingAny ? "overflow-visible" : "overflow-hidden"}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
           {mode === 'week' && (
              <span className="text-xs font-black uppercase tracking-widest text-muted/40 mb-1">
                {format(day, "EEEE")}
              </span>
           )}
           <span className={`
            text-xs font-mono font-black w-8 h-8 flex items-center justify-center rounded-lg transition-all
            ${isTodayDate ? "bg-accent text-bg shadow-lg shadow-accent/20" : isCurrentMonth || mode === 'week' ? "text-muted" : "text-muted/30"}
          `}>
            {format(day, "d")}
          </span>
        </div>

        {onAdd && (
          <button
            onClick={() => onAdd(day)}
            className="p-1.5 rounded-lg text-muted/30 hover:text-accent hover:bg-accent/10 transition-all opacity-0 group-hover/cell:opacity-100"
            title="Add task to this day"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      
      <div className={`flex-1 flex flex-col ${isDraggingAny ? "overflow-visible" : "overflow-y-auto scrollbar-hide"}`}>
        {sortedTasks.map(task => (
          <DraggableTask key={task.id} task={task} onEdit={onEdit} onDuplicate={onDuplicate} allTasks={allTasks} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function TaskCalendar({ tasks: initialTasks, allTasks, spheres, defaultMode = "month", onDuplicate, onAdd }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<"month" | "week">(defaultMode);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  
  const [localTasks, setLocalTasks] = useState<TaskData[]>(initialTasks);
  
  // Use provided allTasks or fallback to localTasks for parent resolution
  const parentResolutionTasks = allTasks || localTasks;

  const handleEdit = (t: TaskData) => {
    setEditingTask(t);
    setIsDuplicate(false);
    setDialogOpen(true);
  };

  const handleDuplicate = (t: TaskData) => {
    if (onDuplicate) {
      onDuplicate(t);
    } else {
      setEditingTask(t);
      setIsDuplicate(true);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
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
      const displayDate = task.plannedDate || task.dueDate;
      if (displayDate) {
        const key = format(new Date(displayDate), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(task);
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
      <div className="flex flex-col bg-[#0f0d0a] border border-[#2e2e2e] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-700">
        {/* Calendar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-8 border-b border-white/[0.03] bg-white/[0.01] gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-xl">
              <CalendarIcon size={20} className="text-accent" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-lg font-black tracking-tighter text-text">
                {format(currentDate, mode === 'month' ? "MMMM yyyy" : "'Week' w, MMMM yyyy")}
              </h2>
              <p className="text-xs font-mono text-muted uppercase tracking-[0.2em] mt-0.5">
                {mode === 'month' ? 'Monthly overview' : 'Weekly focus'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Tabs 
              tabs={[
                { id: "month", label: "Month" },
                { id: "week", label: "Week" }
              ]} 
              activeTab={mode} 
              onTabChange={(id) => setMode(id as "month" | "week")} 
            />

            <div className="h-8 w-px bg-border/40" />

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-muted hover:text-text transition-all"
              >
                Today
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2.5 hover:bg-white/[0.07] rounded-xl text-muted hover:text-text transition-all border border-white/[0.05]"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => navigate(1)}
                  className="p-2.5 hover:bg-white/[0.07] rounded-xl text-muted hover:text-text transition-all border border-white/[0.05]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/[0.03] bg-white/[0.01]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
            <div key={day} className="py-5 text-center text-xs font-black uppercase tracking-[0.4em] text-muted/20">
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
              onAdd={(date) => {
                setEditingTask({ plannedDate: date } as TaskData);
                setIsDuplicate(false);
                setDialogOpen(true);
              }}
              isDraggingAny={isDraggingAny}
              mode={mode}
              allTasks={parentResolutionTasks}
            />
          ))}
        </div>
      </div>

      <TaskFormDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        task={editingTask}
        spheres={spheres}
        allTasks={parentResolutionTasks}
        onViewTask={(t) => setEditingTask(t)}
        isDuplicate={isDuplicate}
      />
    </DndContext>
  );
}
