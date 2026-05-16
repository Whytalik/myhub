"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  eachDayOfInterval,
  eachHourOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addMinutes,
  setHours,
  parseISO,
  isToday,
  differenceInMinutes
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  DndContext, 
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import type { TaskData, LifeSphereData } from "@/features/life/types";
import { updateTaskRangeAction, updateTaskTimeRangeAction } from "@/features/life/actions/task-actions";
import { toast } from "sonner";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskCardBase } from "./TaskCardBase";
import { StatusToggle } from "./StatusToggle";
import { PRIORITY_CONFIG } from "./PriorityBadge";
import { ALL_ICONS } from "./lucide-icons-map";

interface TaskCalendarProps {
  tasks: TaskData[];
  allTasks?: TaskData[];
  spheres: LifeSphereData[];
  defaultMode?: "month" | "week" | "day";
  hideControls?: boolean;
  hideModeSwitch?: boolean;
  onDuplicate?: (task: TaskData) => void;
  onDelete?: () => void;
}

function TaskCalendarCard({ 
  task, 
  onEdit, 
  onDuplicate, 
  onAddChild,
  onDelete,
  allTasks,
  isDraggable = false,
  isOverlay = false,
  startIdx,
  endIdx,
  level = 0,
  rowIdx: _rowIdx = 0,
  onResize,
  isResizing = false,
  onResizeStart,
  onResizeEnd,
  style,
  onHeightChange,
  fixedHeight,
}: {
  task: TaskData,
  onEdit: (t: TaskData) => void,
  onDuplicate?: (t: TaskData) => void,
  onAddChild?: (t: TaskData) => void,
  onDelete?: () => void,
  allTasks: TaskData[],
  isDraggable?: boolean,
  isOverlay?: boolean,
  startIdx?: number,
  endIdx?: number,
  level?: number,
  rowIdx?: number,
  mode?: "month" | "week" | "day",
  days?: Date[],
  onResize?: (taskId: string, daysDelta: number) => void,
  isResizing?: boolean,
  onResizeStart?: (taskId: string) => void,
  onResizeEnd?: () => void,
  style?: React.CSSProperties,
  onHeightChange?: (id: string, height: number) => void,
  fixedHeight?: number,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: task.id, 
    data: task,
    disabled: !isDraggable
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOverlay && ref.current) {
      onHeightChange?.(task.id, ref.current.offsetHeight);
    }
  }, [isOverlay, task.id, task.title, task.description, task.status, task.plannedDate, task.plannedEndDate, onHeightChange]);

  const dragStyle: React.CSSProperties = {
    ...(isDraggable ? {
      transform: CSS.Translate.toString(transform ?? null),
      zIndex: isDragging ? 1000 : isOverlay ? 30 : undefined,
      position: 'relative' as const,
      transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
      willChange: isDragging ? 'transform' : 'auto',
    } : {}),
    ...(fixedHeight ? { minHeight: `${fixedHeight}px` } : {}),
  };

  const overlayStyle: React.CSSProperties = isOverlay ? {
    gridRowStart: 1,
    gridColumnStart: ((startIdx ?? 0) % 7) + 1,
    gridColumnEnd: `span ${Math.max(((endIdx ?? startIdx ?? 0) - (startIdx ?? 0)) + 1, 1)}`,
    left: '0',
    right: '0',
    zIndex: isDragging || isResizing ? 9999 : 30 + level,
    ...style,
  } : {};

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart?.(task.id);

    const startX = e.clientX;
    const container = (e.currentTarget as HTMLElement).closest('.grid-cols-7');
    const cellWidth = container ? container.clientWidth / 7 : 100;

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      onResizeEnd?.();

      const delta = upEvent.clientX - startX;
      const daysDelta = Math.round(delta / cellWidth);
      if (daysDelta !== 0) {
        onResize?.(task.id, daysDelta);
      }
    };

    const handleMouseMove = () => {};

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const showResizeHandle = isOverlay && task.plannedDate;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (ref) ref.current = node;
      }}
      className={isOverlay ? "absolute px-1 pointer-events-auto group/card" : undefined}
      style={isOverlay ? overlayStyle : undefined}
    >
      <TaskCardBase
        task={task}
        variant="compact"
        isDragging={isDragging}
        listeners={listeners}
        attributes={attributes}
        style={isDraggable ? dragStyle : undefined}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onAddChild={onAddChild}
        onDelete={onDelete}
        allTasks={allTasks}
        className={isOverlay ? "!mb-0 shadow-xl border-accent/20 bg-surface/95 backdrop-blur-sm" : undefined}
      />
      {showResizeHandle && (
        <div
          className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize z-30 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-end"
          onMouseDown={handleResizeStart}
        >
          <div className="w-1 h-6 bg-accent/60 rounded-full mr-0.5" />
        </div>
      )}
    </div>
  );
}

function DayTimelineCardWrapper({
  task,
  children,
  style,
  isResizing = false,
}: {
  task: TaskData,
  children: React.ReactNode,
  style?: React.CSSProperties,
  isResizing?: boolean,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: task.id, 
    data: task,
    disabled: isResizing
  });

  const dragStyle: React.CSSProperties = {
    ...style,
    // Strictly disable transform during resizing to prevent any leftward movement or jitter
    transform: (isResizing || !transform) ? 'none' : CSS.Translate.toString(transform),
    zIndex: (isDragging || isResizing) ? 1000 : style?.zIndex,
    // Disable transitions in Day view to avoid jitter and unwanted "snapping" animations
    transition: 'none',
    top: 0,
    willChange: isResizing ? 'width' : (isDragging ? 'transform' : 'auto'),
  };

  return (
    <div
      ref={setNodeRef}
      className="group/day absolute pointer-events-auto box-border"
      style={dragStyle}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

function CalendarDayCell({ 
  day, 
  currentMonth, 
  onAdd,
  mode,
  tasksForDay = [],
  minHeight,
}: { 
  day: Date, 
  currentMonth: Date, 
  onAdd?: (date: Date) => void,
  isDraggingAny: boolean,
  mode: "month" | "week" | "day",
  tasksForDay?: TaskData[],
  minHeight?: number;
}) {
  const dateKey = format(day, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
  });

  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isTodayDate = isToday(day);
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

  const timesForDay = tasksForDay
    .filter(t => t.plannedDate && t.hasPlannedTime)
    .map(t => format(new Date(t.plannedDate!), "HH:mm"))
    .sort();

  return (
    <div
      ref={setNodeRef}
      style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
      className={`
        p-1 md:p-2 border-r border-b border-white/[0.03] transition-colors flex flex-col gap-1 group/cell
        ${mode === 'month' ? (minHeight ? '' : 'min-h-[120px] md:min-h-[200px]') : (minHeight ? '' : 'min-h-[350px] md:min-h-[500px] flex-1')}
        ${!isCurrentMonth && mode === 'month' ? "bg-bg/40 opacity-20" : isWeekend ? "bg-[#11100e]" : "bg-[#141414]"}
        ${isOver ? "bg-accent/[0.05] border-accent/20" : ""}
      `}
    >
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div className="flex flex-col">
           {mode === 'week' && (
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted/40 mb-1">
                {format(day, "EEEE")}
              </span>
           )}
           <span className={`
            text-caption md:text-xs font-mono font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg transition-all
            ${isTodayDate ? "bg-accent text-bg shadow-lg shadow-accent/20" : isCurrentMonth || mode === 'week' ? "text-muted" : "text-muted/30"}
          `}>
            {format(day, "d")}
          </span>
          {timesForDay.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-1">
              {timesForDay.map((time, i) => (
                <span key={i} className="text-[9px] md:text-[10px] font-mono font-bold text-accent/60">
                  {time}
                </span>
              ))}
            </div>
          )}
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
    </div>
  );
}

export function TaskCalendar({ 
  tasks: initialTasks, 
  allTasks,
  spheres,
  defaultMode = "week",
  hideControls = false,
  hideModeSwitch = false,
  onDuplicate,
  onDelete
}: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<"month" | "week" | "day">(defaultMode);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask] = useState<TaskData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [dialogVersion, setDialogVersion] = useState(0);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [draggingTimeline, setDraggingTimeline] = useState<{ id: string, deltaX: number } | null>(null);
  const [resizingTaskId, setResizingTaskId] = useState<string | null>(null);
  const [taskHeights, setTaskHeights] = useState<Record<string, number>>({});
  const [resizingTimeline, setResizingTimeline] = useState<{ id: string, delta: number, edge: 'start' | 'end' } | null>(null);
  
  const [localTasks, setLocalTasks] = useState<TaskData[]>(initialTasks);
  
  useEffect(() => {
    setLocalTasks(initialTasks);
  }, [initialTasks]);

  const parentResolutionTasks = allTasks || localTasks;

  const handleHeightChange = (id: string, height: number) => {
    setTaskHeights(prev => {
      if (prev[id] === height) return prev;
      return { ...prev, [id]: height };
    });
  };

  const maxTaskHeight = useMemo(() => {
    const values = Object.values(taskHeights);
    return values.length > 0 ? Math.max(...values) : 80;
  }, [taskHeights]);

  const calculateTop = (level: number) => {
    const baseTop = mode === 'month' ? 64 : 74;
    const padding = 8;
    return baseTop + level * (maxTaskHeight + padding);
  };

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

  const HOUR_WIDTH = 120;
  const DAY_START = 0;
  const DAY_END = 24;
  const TOTAL_HOURS = DAY_END - DAY_START;
  const TOTAL_WIDTH = HOUR_WIDTH * TOTAL_HOURS;

  const hours = useMemo(() => {
    const start = setHours(startOfDay(currentDate), DAY_START);
    const end = setHours(startOfDay(currentDate), DAY_END - 1);
    return eachHourOfInterval({ start, end });
  }, [currentDate]);

  const timelineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'day' && isSameDay(currentDate, new Date()) && timelineContainerRef.current) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const dayStartMin = DAY_START * 60;
      const scrollPos = ((nowMin - dayStartMin) / 60) * HOUR_WIDTH - 200;
      timelineContainerRef.current.scrollLeft = Math.max(0, scrollPos);
    }
  }, [mode, currentDate]);

  const tasksForDay = useMemo(() => {
    return localTasks.filter(t => t.plannedDate && isSameDay(new Date(t.plannedDate), currentDate));
  }, [localTasks, currentDate]);

  const timelineRows = useMemo(() => {
    const sorted = [...tasksForDay].sort((a, b) => {
      const startA = new Date(a.plannedDate!).getTime();
      const startB = new Date(b.plannedDate!).getTime();
      return startA - startB;
    });

    const rows: TaskData[][] = [];
    sorted.forEach(task => {
      let placed = false;
      for (const row of rows) {
        const lastTask = row[row.length - 1];
        const lastEnd = lastTask.plannedEndDate ? new Date(lastTask.plannedEndDate).getTime() : new Date(lastTask.plannedDate!).getTime() + 3600000;
        const currentStart = new Date(task.plannedDate!).getTime();
        
        if (currentStart >= lastEnd) {
          row.push(task);
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([task]);
      }
    });
    return rows;
  }, [tasksForDay]);

  const handleTimelineDragStart = (event: DragStartEvent) => {
    setIsDraggingAny(true);
    setDraggingTimeline({ id: String(event.active.id), deltaX: 0 });
    document.body.style.cursor = 'grabbing';
  };

  const handleTimelineDragMove = (event: DragMoveEvent) => {
    if (draggingTimeline) {
      setDraggingTimeline({ ...draggingTimeline, deltaX: event.delta.x });
    }
  };

  const handleTimelineDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    setIsDraggingAny(false);
    setDraggingTimeline(null);
    document.body.style.cursor = 'auto';

    const task = active.data.current as TaskData;
    if (!task) return;

    const rawMinutesDelta = (delta.x / HOUR_WIDTH) * 60;
    const minutesDelta = Math.round(rawMinutesDelta / 5) * 5;
    if (minutesDelta === 0) return;

    const originalStart = new Date(task.plannedDate!);
    const newStart = addMinutes(originalStart, minutesDelta);
    const durationMs = task.plannedEndDate 
      ? new Date(task.plannedEndDate).getTime() - originalStart.getTime()
      : 3600000;
    const newEnd = new Date(newStart.getTime() + durationMs);

    const originalTasks = [...localTasks];
    setLocalTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, plannedDate: newStart, plannedEndDate: newEnd } : t
    ));

    const result = await updateTaskTimeRangeAction(task.id, newStart.toISOString(), newEnd.toISOString());
    if (result.success) {
      toast.success("Task moved");
    } else {
      setLocalTasks(originalTasks);
      toast.error(result.error || "Failed to move task");
    }
  };

  const handleTimelineResize = async (taskId: string, minutesDeltaRaw: number, edge: 'start' | 'end') => {
    const task = localTasks.find(t => t.id === taskId);
    if (!task || !task.plannedDate) return;

    const minutesDelta = Math.round(minutesDeltaRaw / 5) * 5;
    if (minutesDelta === 0) return;

    let newStart = new Date(task.plannedDate);
    let newEnd = task.plannedEndDate ? new Date(task.plannedEndDate) : addMinutes(newStart, 60);

    if (edge === 'start') {
      newStart = addMinutes(newStart, minutesDelta);
    } else {
      newEnd = addMinutes(newEnd, minutesDelta);
    }

    if (differenceInMinutes(newEnd, newStart) < 60) {
      if (edge === 'start') {
        newStart = addMinutes(newEnd, -60);
      } else {
        newEnd = addMinutes(newStart, 60);
      }
    }

    const originalTasks = [...localTasks];
    setLocalTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, plannedDate: newStart, plannedEndDate: newEnd } : t
    ));

    const result = await updateTaskTimeRangeAction(task.id, newStart.toISOString(), newEnd.toISOString());
    if (result.success) {
      toast.success("Task resized");
    } else {
      setLocalTasks(originalTasks);
      toast.error(result.error || "Failed to resize task");
    }
  };

  const allTasksWithLevels = useMemo(() => {
    const levelsByRow: Record<number, { taskId: string, startIdx: number, endIdx: number, level: number }[]> = {};
    
    // 1. Get unique tasks that actually have a planned date
    const tasksWithDates = localTasks.filter(t => t.plannedDate);
    
    // 2. Sort tasks by start date, then title for stability
    const sortedTasks = [...tasksWithDates].sort((a, b) => {
      const aStart = new Date(a.plannedDate!).getTime();
      const bStart = new Date(b.plannedDate!).getTime();
      if (aStart !== bStart) return aStart - bStart;
      return a.title.localeCompare(b.title);
    });

    return sortedTasks.flatMap(task => {
      const start = new Date(task.plannedDate!);
      const end = task.plannedEndDate ? new Date(task.plannedEndDate) : start;
      
      const startKey = format(start, "yyyy-MM-dd");
      const endKey = format(end, "yyyy-MM-dd");
      
      let startIdxTotal = days.findIndex(d => format(d, "yyyy-MM-dd") === startKey);
      let endIdxTotal = days.findIndex(d => format(d, "yyyy-MM-dd") === endKey);
      
      const viewStart = days[0];
      const viewEnd = days[days.length - 1];
      
      // Handle tasks partially outside the current view
      if (startIdxTotal === -1) {
        if (start < viewStart && end >= viewStart) startIdxTotal = 0;
        else return [];
      }
      if (endIdxTotal === -1) {
        if (end > viewEnd && start <= viewEnd) endIdxTotal = days.length - 1;
        else return [];
      }

      // 3. Find a consistent level for the entire task span across all rows
      let level = 0;
      // Re-implementing stable level logic
      const rows = [];
      for (let r = Math.floor(startIdxTotal / 7); r <= Math.floor(endIdxTotal / 7); r++) rows.push(r);

      while (true) {
        let collision = false;
        for (const r of rows) {
          const rowStart = r * 7;
          const rowEnd = rowStart + 6;
          const s = Math.max(startIdxTotal, rowStart);
          const e = Math.min(endIdxTotal, rowEnd);
          if (levelsByRow[r]?.some(l => l.level === level && !(e < l.startIdx || s > l.endIdx))) {
            collision = true;
            break;
          }
        }
        if (!collision) break;
        level++;
      }

      const segments = [];
      for (const r of rows) {
        const rowStart = r * 7;
        const rowEnd = rowStart + 6;
        const s = Math.max(startIdxTotal, rowStart);
        const e = Math.min(endIdxTotal, rowEnd);
        if (!levelsByRow[r]) levelsByRow[r] = [];
        levelsByRow[r].push({ taskId: task.id, startIdx: s, endIdx: e, level });
        segments.push({ task, startIdx: s, endIdx: e, level, rowIdx: r });
      }
      return segments;
    });
  }, [localTasks, days]);

  const handleDragStart = () => {
    setIsDraggingAny(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDraggingAny(false);
    document.body.style.cursor = 'auto';

    if (over) {
      const taskId = active.id as string;
      const newDateStr = over.id as string;

      const task = localTasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.plannedDate && format(new Date(task.plannedDate), 'yyyy-MM-dd') === newDateStr) return;
      
      const newStartDate = new Date(newDateStr);
      if (task.plannedDate) {
        const oldDate = new Date(task.plannedDate);
        newStartDate.setHours(oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());
      }
      
      let newEndDate = null;
      if (task.plannedDate && task.plannedEndDate) {
        const durationMs = new Date(task.plannedEndDate).getTime() - new Date(task.plannedDate).getTime();
        newEndDate = new Date(newStartDate.getTime() + durationMs);
      }
      
      const originalTasks = [...localTasks];
      setLocalTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, plannedDate: newStartDate, plannedEndDate: newEndDate };
        }
        return t;
      }));

      const result = await updateTaskRangeAction(taskId, newStartDate.toISOString(), newEndDate?.toISOString() ?? null);
      if (result.success) {
        toast.success(`Moved to ${format(parseISO(newDateStr), "MMM d")}`);
      } else {
        setLocalTasks(originalTasks);
        toast.error(result.error || "Failed to move task");
      }
    }
  };

  const handleResize = async (taskId: string, daysDelta: number) => {
    const originalTask = localTasks.find(t => t.id === taskId);
    if (!originalTask || !originalTask.plannedDate) return;
    
    const currentStart = new Date(originalTask.plannedDate);
    const currentEnd = originalTask.plannedEndDate ? new Date(originalTask.plannedEndDate) : new Date(currentStart);
    
    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + daysDelta);
    
    const startTs = new Date(currentStart).setHours(0, 0, 0, 0);
    const newEndTs = new Date(newEnd).setHours(0, 0, 0, 0);

    if (newEndTs < startTs) return;

    const isSameDayVal = startTs === newEndTs;
    const finalEnd = isSameDayVal ? null : newEnd;
    
    const originalTasks = [...localTasks];
    setLocalTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, plannedDate: currentStart, plannedEndDate: finalEnd }
        : t
    ));
    
    const result = await updateTaskRangeAction(taskId, currentStart.toISOString(), finalEnd?.toISOString() ?? null);
    if (result.success) {
      toast.success("Task duration updated");
    } else {
      setLocalTasks(originalTasks);
      toast.error(result.error || "Failed to update task duration");
    }
  };

  const navigate = (direction: number) => {
    if (mode === "month") {
      setCurrentDate(prev => direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    } else if (mode === "week") {
      setCurrentDate(prev => direction > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction > 0 ? addDays(prev, 1) : subDays(prev, 1));
    }
  };

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const rowHeights = useMemo(() => {
    const heights: Record<number, number> = {};
    const baseTop = mode === 'month' ? 64 : 74;
    const padding = 8;
    const minCellHeight = mode === 'month' ? 200 : 500;

    const rowCount = Math.ceil(days.length / 7);
    
    for (let r = 0; r < rowCount; r++) {
      let total = baseTop;
      const rowSegments = allTasksWithLevels.filter(s => s.rowIdx === r);
      const maxLevel = rowSegments.length > 0 ? Math.max(...rowSegments.map(s => s.level)) : -1;
      
      if (maxLevel >= 0) {
        total += (maxLevel + 1) * (maxTaskHeight + padding);
      }
      heights[r] = Math.max(minCellHeight, total);
    }

    return heights;
  }, [allTasksWithLevels, maxTaskHeight, mode, days.length]);

  const tasksByDayIndex = useMemo(() => {
    const map: Record<number, TaskData[]> = {};
    localTasks.forEach(task => {
      if (!task.plannedDate) return;
      const taskDate = new Date(task.plannedDate);
      const idx = days.findIndex(d => isSameDay(d, taskDate));
      if (idx >= 0) {
        if (!map[idx]) map[idx] = [];
        map[idx].push(task);
      }
    });
    return map;
  }, [localTasks, days]);

  const renderGridBody = () => (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-7 border-b border-white/[0.03] bg-white/[0.01]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
            <div key={day} className={`py-3 md:py-5 text-center text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] ${i >= 5 ? "text-amber-500/30" : "text-muted/20"}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="relative min-w-full flex flex-col border-l border-white/[0.03]">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="relative">
              <div className="grid grid-cols-7">
                {week.map((day, dayIdx) => (
                  <CalendarDayCell 
                    key={dayIdx} 
                    day={day} 
                    currentMonth={currentDate} 
                    onAdd={(date) => {
                      setEditingTask({ plannedDate: date } as TaskData);
                      setParentTask(null);
                      setIsDuplicate(false);
                      setDialogVersion(v => v + 1);
                      setDialogOpen(true);
                    }}
                    isDraggingAny={isDraggingAny}
                    mode={mode}
                    tasksForDay={tasksByDayIndex[weekIdx * 7 + dayIdx] || []}
                    minHeight={rowHeights[weekIdx]}
                  />
                ))}
              </div>

              <div className="absolute inset-0 pointer-events-none grid grid-cols-7">
                {allTasksWithLevels
                  .filter(seg => seg.rowIdx === weekIdx)
                  .map((seg) => (
                    <TaskCalendarCard
                      key={`task-${seg.task.id}-${seg.startIdx}-${seg.endIdx}`}
                      task={seg.task}
                      startIdx={seg.startIdx}
                      endIdx={seg.endIdx}
                      level={seg.level}
                      rowIdx={seg.rowIdx}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onAddChild={handleAddChild}
                      onDelete={handleTaskDeleted}
                      allTasks={parentResolutionTasks}
                      mode={mode}
                      days={days}
                      onResize={handleResize}
                      isResizing={resizingTaskId === seg.task.id}
                      onResizeStart={(id) => setResizingTaskId(id)}
                      onResizeEnd={() => setResizingTaskId(null)}
                      isOverlay
                      isDraggable
                      onHeightChange={handleHeightChange}
                      fixedHeight={maxTaskHeight}
                      style={{
                        top: `${calculateTop(seg.level)}px`,
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col bg-surface border border-border rounded-xl md:rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-700 min-w-0">
        {/* Header Controls */}
        {!hideControls && <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 md:p-6 lg:p-8 border-b border-white/[0.03] bg-white/[0.01] gap-4 lg:gap-6">
          <div className="flex items-center justify-between lg:justify-start gap-4 lg:gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl shrink-0">
                <CalendarIcon size={20} className="text-accent md:w-5 md:h-5 w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-sm md:text-base font-black tracking-tighter text-text truncate">
                  {mode === 'day' 
                    ? format(currentDate, "MMMM d, yyyy") 
                    : mode === 'month' 
                      ? format(currentDate, "MMMM yyyy") 
                      : format(currentDate, "'Week' w, MMMM yyyy")}
                </h2>
                <p className="text-[10px] md:text-caption font-mono text-muted uppercase tracking-[0.2em] mt-0.5 truncate">
                  {mode === 'month' ? 'Monthly overview' : mode === 'week' ? 'Weekly focus' : 'Daily timeline'}
                </p>
              </div>
            </div>

            {/* Navigation arrows (desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-surface/50 border border-border/50 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 hover:bg-raised rounded-lg text-muted hover:text-text transition-all"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-raised rounded-lg text-muted hover:text-text transition-all border-x border-border/30 mx-0.5"
              >
                Today
              </button>
              <button
                onClick={() => navigate(1)}
                className="p-1.5 hover:bg-raised rounded-lg text-muted hover:text-text transition-all"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 md:gap-6">
            {/* Navigation arrows (mobile) */}
            <div className="flex md:hidden items-center gap-1 bg-surface/50 border border-border/50 rounded-xl p-1 shadow-inner">
              <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-raised rounded-lg text-muted"><ChevronLeft size={14} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 text-[9px] font-bold text-muted">Today</button>
              <button onClick={() => navigate(1)} className="p-1.5 hover:bg-raised rounded-lg text-muted"><ChevronRight size={14} /></button>
            </div>

            {/* View switcher */}
            {!hideModeSwitch && (
              <div className="flex p-1 bg-surface border border-border/50 rounded-xl shadow-sm w-fit relative overflow-hidden shrink-0">
                {["month", "week", "day"].map((id) => {
                  const isActive = mode === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setMode(id as "month" | "week" | "day")}
                      className={`
                        relative flex items-center gap-2 whitespace-nowrap px-3 md:px-5 lg:px-6 py-1.5 md:py-2 rounded-xl text-[10px] md:text-caption font-mono font-bold uppercase tracking-widest transition-all duration-200 z-10
                        ${isActive ? "text-bg" : "text-secondary hover:text-text"}
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeViewTab"
                          className="absolute inset-0 bg-accent rounded-xl shadow-lg shadow-accent/20"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{id}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>}

        {/* Content Body */}
        <div className="flex-1">
          {mode === 'day' ? (
            <div className="flex flex-col h-[600px]">
              <div 
                ref={timelineContainerRef}
                className="relative flex-1 overflow-auto border border-white/[0.03] rounded-none bg-bg/30 scrollbar-show"
              >
                <div 
                  className="relative min-h-full" 
                  style={{ width: TOTAL_WIDTH }}
                >
                  <div className="sticky top-0 z-20 flex h-8 border-b border-white/[0.03] bg-surface/80 backdrop-blur-md">
                    {hours.map((hour, i) => (
                      <div 
                        key={i} 
                        className="flex-none border-r border-white/[0.03] last:border-0 flex flex-col justify-end px-2"
                        style={{ width: HOUR_WIDTH }}
                      >
                        <span className="text-label font-mono font-bold text-muted/50 uppercase">
                          {format(hour, "HH:mm")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 pointer-events-none flex">
                    {hours.map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-none border-r border-white/[0.03] h-full relative"
                        style={{ width: HOUR_WIDTH }}
                      >
                        <div className="absolute right-3/4 top-0 bottom-0 border-r border-white/[0.015]" />
                        <div className="absolute right-2/4 top-0 bottom-0 border-r border-white/[0.015]" />
                        <div className="absolute right-1/4 top-0 bottom-0 border-r border-white/[0.015]" />
                      </div>
                    ))}
                  </div>

                  {isToday(currentDate) && (() => {
                    const now = new Date();
                    const nowMin = now.getHours() * 60 + now.getMinutes();
                    const dayStartMin = DAY_START * 60;
                    if (nowMin >= dayStartMin && nowMin <= DAY_END * 60) {
                      return (
                        <div 
                          className="absolute top-0 bottom-0 z-10 w-[2px] bg-accent pointer-events-none"
                          style={{ left: `${((nowMin - dayStartMin) / 60) * HOUR_WIDTH}px` }}
                        >
                          <div className="absolute -left-[5px] top-8 w-3 h-3 bg-accent rounded-full border-2 border-bg" />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <DndContext 
                    sensors={sensors} 
                    onDragStart={handleTimelineDragStart}
                    onDragMove={handleTimelineDragMove}
                    onDragEnd={handleTimelineDragEnd}
                  >
                    <div className="relative py-2 flex flex-col gap-2 min-h-[300px]">
                      {timelineRows.map((rowTasks, rowIdx) => (
                        <div key={rowIdx} className="relative h-10 w-full">
                          {rowTasks.map(task => {
                            const isResizingThis = resizingTimeline?.id === task.id;
                            const isDraggingThis = draggingTimeline?.id === task.id;
                            
                            const resDelta = isResizingThis ? Math.round(resizingTimeline!.delta / 5) * 5 : 0;
                            const drgDelta = isDraggingThis ? Math.round((draggingTimeline!.deltaX / HOUR_WIDTH) * 60 / 5) * 5 : 0;
                            
                            let start = new Date(task.plannedDate!);
                            let end = task.plannedEndDate ? new Date(task.plannedEndDate) : addMinutes(start, 60);
                            
                            if (isResizingThis) {
                              if (resizingTimeline!.edge === 'start') {
                                start = addMinutes(start, resDelta);
                              } else {
                                const potentialEnd = addMinutes(end, resDelta);
                                if (differenceInMinutes(potentialEnd, start) >= 60) {
                                  end = potentialEnd;
                                } else {
                                  end = addMinutes(start, 60);
                                }
                              }
                            } else if (isDraggingThis) {
                              start = addMinutes(start, drgDelta);
                              end = addMinutes(end, drgDelta);
                            }

                            const startMin = start.getHours() * 60 + start.getMinutes();
                            const endMin = end.getHours() * 60 + end.getMinutes();
                            const dStartMin = DAY_START * 60;
                            const leftPos = ((startMin - dStartMin) / 60) * HOUR_WIDTH;
                            const widthVal = ((endMin - startMin) / 60) * HOUR_WIDTH;
                            
                            const pCfg = PRIORITY_CONFIG[task.priority];
                            
                            return (
                              <DayTimelineCardWrapper
                                key={task.id}
                                task={task}
                                isResizing={isResizingThis}
                                style={{
                                  left: `${leftPos}px`,
                                  width: `${Math.max(widthVal, HOUR_WIDTH)}px`,
                                  zIndex: isResizingThis || isDraggingThis ? 50 : 10,
                                }}
                              >
                                {(isResizingThis || isDraggingThis) && (
                                  <div className="absolute -top-6 left-0 right-0 flex justify-between px-1 pointer-events-none animate-in fade-in slide-in-from-bottom-1">
                                    <div className="bg-accent text-bg text-label font-mono font-black px-1.5 py-0.5 rounded shadow-lg shadow-accent/20">
                                      {format(start, "HH:mm")}
                                    </div>
                                    <div className="bg-accent text-bg text-label font-mono font-black px-1.5 py-0.5 rounded shadow-lg shadow-accent/20">
                                      {format(end, "HH:mm")}
                                    </div>
                                  </div>
                                )}
                                <div
                                  className={`flex flex-col gap-1.5 rounded-xl border p-2.5 overflow-hidden cursor-grab active:cursor-grabbing min-h-[100px] ${
                                    isDraggingThis || isResizingThis
                                      ? 'shadow-elevated ring-2 ring-accent border-accent bg-elevated'
                                      : 'shadow-md border-accent/20 bg-surface/95 backdrop-blur-sm hover:border-accent/40'
                                  }`}
                                  onClick={() => {
                                    if (!isDraggingAny) handleEdit(task);
                                  }}
                                >
                                  <div className="flex items-center justify-between pointer-events-none">
                                    <span className="text-caption font-mono font-black text-accent tracking-tighter">
                                      {format(start, "HH:mm")} — {format(end, "HH:mm")}
                                    </span>
                                    {task.icon && ALL_ICONS[task.icon] && React.createElement(ALL_ICONS[task.icon], { size: 10, className: "text-muted/40" })}
                                  </div>

                                  <h4 className="text-note font-black leading-tight text-text line-clamp-2 uppercase tracking-tight pointer-events-none">
                                    {task.title}
                                  </h4>

                                  <div className="flex items-center gap-2 mt-auto pt-1.5 border-t border-white/[0.03]">
                                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                      <StatusToggle 
                                        taskId={task.id} 
                                        status={task.status} 
                                        variant="badge" 
                                        size="sm" 
                                      />
                                    </div>

                                    <div className="w-px h-3 bg-white/5 shrink-0" />

                                    <div className="flex items-center gap-2 min-w-0 pointer-events-none">
                                      {task.sphere && (
                                        <div className="flex items-center gap-1 min-w-0">
                                          <div 
                                            className="w-1.5 h-1.5 rounded-full shrink-0" 
                                            style={{ backgroundColor: task.sphere.color }} 
                                          />
                                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted truncate">
                                            {task.sphere.name}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1 shrink-0">
                                        {React.createElement(pCfg.icon, { 
                                          size: 10, 
                                          style: { color: pCfg.color } 
                                        })}
                                        <span 
                                          className="text-[10px] font-mono font-black uppercase tracking-tighter"
                                          style={{ color: pCfg.color }}
                                        >
                                          {pCfg.label}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div 
                                  className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize z-30 opacity-0 group-hover/day:opacity-100 transition-opacity flex items-center justify-end pr-0.5"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const sX = e.clientX;
                                    
                                    const hMouseMove = (mv: MouseEvent) => {
                                      const dX = mv.clientX - sX;
                                      const minDelta = (dX / HOUR_WIDTH) * 60;
                                      setResizingTimeline({ id: task.id, delta: minDelta, edge: 'end' });
                                    };

                                    const hMouseUp = (ev: MouseEvent) => {
                                      document.removeEventListener("mousemove", hMouseMove);
                                      document.removeEventListener("mouseup", hMouseUp);
                                      
                                      const dX = ev.clientX - sX;
                                      const minDelta = Math.round(((dX / HOUR_WIDTH) * 60) / 5) * 5;
                                      
                                      if (minDelta !== 0) {
                                        const cDur = differenceInMinutes(end, start);
                                        if (cDur + minDelta < 60) {
                                          handleTimelineResize(task.id, 60 - cDur, 'end');
                                        } else {
                                          handleTimelineResize(task.id, minDelta, 'end');
                                        }
                                      }
                                      setResizingTimeline(null);
                                    };
                                    
                                    document.addEventListener("mousemove", hMouseMove);
                                    document.addEventListener("mouseup", hMouseUp);
                                  }}
                                >
                                  <div className="w-1 h-6 bg-accent/40 rounded-full" />
                                </div>
                              </DayTimelineCardWrapper>
                            );
                          })}
                        </div>
                      ))}
                      
                      {timelineRows.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted/20">
                          <Clock size={48} strokeWidth={1} />
                          <p className="text-caption font-mono uppercase tracking-[0.2em] mt-4">No tasks scheduled for this day</p>
                        </div>
                      )}
                    </div>
                  </DndContext>
                </div>
              </div>
            </div>
          ) : renderGridBody()}
        </div>
      </div>

      <TaskFormDialog
        key={`task-form-${dialogVersion}-${editingTask?.id ?? 'new'}`}
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={(savedTask) => {
          setLocalTasks(prev => {
            const existing = prev.find(t => t.id === savedTask.id);
            if (existing) {
              return prev.map(t => t.id === savedTask.id ? savedTask : t);
            }
            return [...prev, savedTask];
          });
        }}
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
