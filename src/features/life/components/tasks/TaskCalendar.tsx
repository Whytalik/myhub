"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
  differenceInMinutes,
  isBefore,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
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
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import type { TaskData, LifeSphereData } from "@/features/life/types";
import {
  updateTaskRangeAction,
  updateTaskTimeRangeAction,
} from "@/features/life/actions/task-actions";
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
  minCellHeight?: number;
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
  task: TaskData;
  onEdit: (t: TaskData) => void;
  onDuplicate?: (t: TaskData) => void;
  onAddChild?: (t: TaskData) => void;
  onDelete?: () => void;
  allTasks: TaskData[];
  isDraggable?: boolean;
  isOverlay?: boolean;
  startIdx?: number;
  endIdx?: number;
  level?: number;
  rowIdx?: number;
  mode?: "month" | "week" | "day";
  days?: Date[];
  onResize?: (taskId: string, daysDelta: number) => void;
  isResizing?: boolean;
  onResizeStart?: (taskId: string) => void;
  onResizeEnd?: () => void;
  style?: React.CSSProperties;
  onHeightChange?: (id: string, height: number) => void;
  fixedHeight?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
    disabled: !isDraggable,
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOverlay && ref.current) {
      onHeightChange?.(task.id, ref.current.offsetHeight);
    }
  }, [
    isOverlay,
    task.id,
    task.title,
    task.description,
    task.status,
    task.plannedDate,
    task.plannedEndDate,
    onHeightChange,
  ]);

  const dragStyle: React.CSSProperties = {
    ...(isDraggable
      ? {
          transform: CSS.Translate.toString(transform ?? null),
          zIndex: isDragging ? 1000 : isOverlay ? 30 : undefined,
          position: "relative" as const,
          transition: isDragging ? "none" : "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
          willChange: isDragging ? "transform" : "auto",
        }
      : {}),
    ...(fixedHeight ? { minHeight: `${fixedHeight}px` } : {}),
  };

  const overlayStyle: React.CSSProperties = isOverlay
    ? {
        position: "absolute" as const,
        gridRowStart: 1,
        gridColumnStart: ((startIdx ?? 0) % 7) + 1,
        gridColumnEnd: `span ${Math.max((endIdx ?? startIdx ?? 0) - (startIdx ?? 0) + 1, 1)}`,
        left: "0",
        right: "0",
        zIndex: isDragging || isResizing ? 9999 : 30 + level,
        ...style,
      }
    : {};

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart?.(task.id);

    const startX = e.clientX;
    const container = (e.currentTarget as HTMLElement).closest(".grid-cols-7");
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
  const combinedStyle: React.CSSProperties = { ...dragStyle, ...overlayStyle };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (ref) ref.current = node;
      }}
      className={isOverlay ? "absolute" : "relative"}
      style={combinedStyle}
    >
      <TaskCardBase
        task={task}
        variant="compact"
        isDragging={isDragging}
        listeners={listeners}
        attributes={attributes}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onAddChild={onAddChild}
        onDelete={onDelete}
        allTasks={allTasks}
      />
      {showResizeHandle && (
        <div
          className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize flex items-center justify-center z-10"
          onMouseDown={handleResizeStart}
        >
          <div className="w-0.5 h-4 rounded-full bg-white/20 hover:bg-accent transition-colors" />
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
  task: TaskData;
  children: React.ReactNode;
  style?: React.CSSProperties;
  isResizing?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task,
    disabled: isResizing,
  });

  const dragStyle: React.CSSProperties = {
    ...style,
    transform: "none",
    zIndex: isDragging || isResizing ? 1000 : style?.zIndex,
    transition: "none",
    top: 0,
    willChange: isResizing ? "width" : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      className="absolute h-full"
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
  day: Date;
  currentMonth: Date;
  onAdd?: (date: Date) => void;
  isDraggingAny: boolean;
  mode: "month" | "week" | "day";
  tasksForDay?: TaskData[];
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
    .filter((t) => t.plannedDate && t.hasPlannedTime)
    .map((t) => format(new Date(t.plannedDate!), "HH:mm"))
    .sort();

  const cellClass = `group relative flex flex-col border-r border-b border-white/[0.06] transition-colors duration-150 ${
    isOver ? "bg-accent/5" : ""
  } ${!isCurrentMonth ? "bg-black/10" : ""}`;
  const dayNumberClass = `text-xs font-mono font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
    isTodayDate
      ? "bg-accent text-white"
      : isWeekend
        ? "text-zinc-600"
        : isCurrentMonth
          ? "text-zinc-300"
          : "text-zinc-700"
  }`;

  return (
    <div
      ref={setNodeRef}
      className={cellClass}
      style={{ minHeight: minHeight ? `${minHeight}px` : undefined }}
    >
      <div className="flex items-start justify-between px-2 pt-2">
        <div className="flex flex-col gap-0.5">
          {mode === "week" && (
            <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-500">
              {format(day, "EEEE")}
            </span>
          )}
          <span className={dayNumberClass}>{format(day, "d")}</span>
          {timesForDay.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {timesForDay.map((time, i) => (
                <span
                  key={i}
                  className="text-[9px] font-mono text-zinc-500 bg-white/5 px-1 rounded"
                >
                  {time}
                </span>
              ))}
            </div>
          )}
        </div>

        {onAdd && (
          <button
            onClick={() => onAdd(day)}
            title="Add task to this day"
            className="p-1 rounded-md text-zinc-600 hover:text-accent hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Plus size={12} />
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
  onDelete,
  minCellHeight,
}: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<"month" | "week" | "day">(defaultMode);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask] = useState<TaskData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [dialogVersion, setDialogVersion] = useState(0);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [draggingTimeline, setDraggingTimeline] = useState<{ id: string; deltaX: number } | null>(
    null,
  );
  const [resizingTaskId, setResizingTaskId] = useState<string | null>(null);
  const [taskHeights, setTaskHeights] = useState<Record<string, number>>({});
  const [resizingTimeline, setResizingTimeline] = useState<{
    id: string;
    delta: number;
    edge: "start" | "end";
  } | null>(null);

  const [localTasks, setLocalTasks] = useState<TaskData[]>(initialTasks);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setLocalTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    if (mode !== "day") return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [mode]);

  const parentResolutionTasks = allTasks || localTasks;

  const handleHeightChange = (id: string, height: number) => {
    setTaskHeights((prev) => {
      if (prev[id] === height) return prev;
      return { ...prev, [id]: height };
    });
  };



  const handleEdit = (t: TaskData) => {
    setEditingTask(t);
    setParentTask(null);
    setIsDuplicate(false);
    setDialogVersion((v) => v + 1);
    setDialogOpen(true);
  };

  const handleDuplicate = (t: TaskData) => {
    if (onDuplicate) {
      onDuplicate(t);
    } else {
      setEditingTask(t);
      setParentTask(null);
      setIsDuplicate(true);
      setDialogVersion((v) => v + 1);
      setDialogOpen(true);
    }
  };

  const handleAddChild = (parent: TaskData) => {
    setEditingTask(null);
    setParentTask(parent);
    setIsDuplicate(false);
    setDialogVersion((v) => v + 1);
    setDialogOpen(true);
  };

  const handleTaskStatusChange = (taskId: string, newStatus: TaskData["status"]) => {
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  const handleTaskDeleted = () => {
    setDialogVersion((v) => v + 1);
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
    }),
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
    if (mode === "day" && isSameDay(currentDate, new Date()) && timelineContainerRef.current) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const dayStartMin = DAY_START * 60;
      const scrollPos = ((nowMin - dayStartMin) / 60) * HOUR_WIDTH - 200;
      timelineContainerRef.current.scrollLeft = Math.max(0, scrollPos);
    }
  }, [mode, currentDate]);

  const projectTasks = useMemo(
    () => localTasks.filter((t) => !t.parentId && t.children.length > 0),
    [localTasks],
  );

  const calendarTasks = useMemo(
    () => localTasks.filter((t) => t.children.length === 0),
    [localTasks],
  );

  const tasksForDay = useMemo(() => {
    return calendarTasks.filter(
      (t) => t.plannedDate && isSameDay(new Date(t.plannedDate), currentDate),
    );
  }, [calendarTasks, currentDate]);

  const scheduledTasks = useMemo(
    () => tasksForDay.filter((t) => t.hasPlannedTime && t.status !== "DONE"),
    [tasksForDay],
  );
  const unscheduledTasks = useMemo(
    () => tasksForDay.filter((t) => !t.hasPlannedTime && t.status !== "DONE"),
    [tasksForDay],
  );

  const timelineRows = useMemo(() => {
    const sorted = [...scheduledTasks].sort(
      (a, b) => new Date(a.plannedDate!).getTime() - new Date(b.plannedDate!).getTime(),
    );
    return sorted.map((task) => [task]);
  }, [scheduledTasks]);

  const handleTimelineDragStart = (event: DragStartEvent) => {
    setIsDraggingAny(true);
    setDraggingTimeline({ id: String(event.active.id), deltaX: 0 });
    document.body.style.cursor = "grabbing";
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
    document.body.style.cursor = "auto";

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
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, plannedDate: newStart, plannedEndDate: newEnd } : t,
      ),
    );

    const result = await updateTaskTimeRangeAction(
      task.id,
      newStart.toISOString(),
      newEnd.toISOString(),
    );
    if (result.success) {
      toast.success("Task moved");
    } else {
      setLocalTasks(originalTasks);
      toast.error(result.error || "Failed to move task");
    }
  };

  const handleTimelineResize = async (
    taskId: string,
    minutesDeltaRaw: number,
    edge: "start" | "end",
  ) => {
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || !task.plannedDate) return;

    const minutesDelta = Math.round(minutesDeltaRaw / 5) * 5;
    if (minutesDelta === 0) return;

    let newStart = new Date(task.plannedDate);
    let newEnd = task.plannedEndDate ? new Date(task.plannedEndDate) : addMinutes(newStart, 60);

    if (edge === "start") {
      newStart = addMinutes(newStart, minutesDelta);
    } else {
      newEnd = addMinutes(newEnd, minutesDelta);
    }

    if (differenceInMinutes(newEnd, newStart) < 60) {
      if (edge === "start") {
        newStart = addMinutes(newEnd, -60);
      } else {
        newEnd = addMinutes(newStart, 60);
      }
    }

    const originalTasks = [...localTasks];
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, plannedDate: newStart, plannedEndDate: newEnd } : t,
      ),
    );

    const result = await updateTaskTimeRangeAction(
      task.id,
      newStart.toISOString(),
      newEnd.toISOString(),
    );
    if (result.success) {
      toast.success("Task resized");
    } else {
      setLocalTasks(originalTasks);
      toast.error(result.error || "Failed to resize task");
    }
  };

  const allTasksWithLevels = useMemo(() => {
    const levelsByRow: Record<
      number,
      { taskId: string; startIdx: number; endIdx: number; level: number }[]
    > = {};

    const tasksWithDates = calendarTasks.filter((t) => t.plannedDate);

    const sortedTasks = [...tasksWithDates].sort((a, b) => {
      const aStart = new Date(a.plannedDate!).getTime();
      const bStart = new Date(b.plannedDate!).getTime();
      if (aStart !== bStart) return aStart - bStart;
      return a.title.localeCompare(b.title);
    });

    return sortedTasks.flatMap((task) => {
      const start = new Date(task.plannedDate!);
      const end = task.plannedEndDate ? new Date(task.plannedEndDate) : start;

      const startKey = format(start, "yyyy-MM-dd");
      const endKey = format(end, "yyyy-MM-dd");

      let startIdxTotal = days.findIndex((d) => format(d, "yyyy-MM-dd") === startKey);
      let endIdxTotal = days.findIndex((d) => format(d, "yyyy-MM-dd") === endKey);

      const viewStart = days[0];
      const viewEnd = days[days.length - 1];

      if (startIdxTotal === -1) {
        if (start < viewStart && end >= viewStart) startIdxTotal = 0;
        else return [];
      }
      if (endIdxTotal === -1) {
        if (end > viewEnd && start <= viewEnd) endIdxTotal = days.length - 1;
        else return [];
      }

      const rows = [];
      for (let r = Math.floor(startIdxTotal / 7); r <= Math.floor(endIdxTotal / 7); r++)
        rows.push(r);

      const segments = [];
      for (const r of rows) {
        const rowStart = r * 7;
        const rowEnd = rowStart + 6;
        const s = Math.max(startIdxTotal, rowStart);
        const e = Math.min(endIdxTotal, rowEnd);
        if (!levelsByRow[r]) levelsByRow[r] = [];

        let level = 0;
        while (levelsByRow[r].some((l) => l.level === level && !(e < l.startIdx || s > l.endIdx))) {
          level++;
        }

        levelsByRow[r].push({ taskId: task.id, startIdx: s, endIdx: e, level });
        segments.push({ task, startIdx: s, endIdx: e, level, rowIdx: r });
      }
      return segments;
    });
  }, [calendarTasks, days]);
  const maxTaskHeightForRow = useCallback((rowIdx: number) => {
    const rowSegments = allTasksWithLevels.filter((s) => s.rowIdx === rowIdx);
    const heights = rowSegments
      .map((s) => taskHeights[s.task.id])
      .filter((h): h is number => typeof h === "number");
    return heights.length > 0 ? Math.max(...heights) : 80;
  }, [allTasksWithLevels, taskHeights]);

  const calculateTop = useCallback((level: number, rowIdx: number) => {
    const baseTop = mode === "month" ? 64 : 74;
    const padding = 8;
    const rowMaxHeight = maxTaskHeightForRow(rowIdx);
    return baseTop + level * (rowMaxHeight + padding);
  }, [mode, maxTaskHeightForRow]);

  const handleDragStart = () => {
    setIsDraggingAny(true);
    document.body.style.cursor = "grabbing";
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDraggingAny(false);
    document.body.style.cursor = "auto";

    if (over) {
      const taskId = active.id as string;
      const newDateStr = over.id as string;

      const task = localTasks.find((t) => t.id === taskId);
      if (!task) return;

      if (task.plannedDate && format(new Date(task.plannedDate), "yyyy-MM-dd") === newDateStr)
        return;

      const newStartDate = new Date(newDateStr);
      if (task.plannedDate) {
        const oldDate = new Date(task.plannedDate);
        newStartDate.setHours(oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());
      }

      let newEndDate = null;
      if (task.plannedDate && task.plannedEndDate) {
        const durationMs =
          new Date(task.plannedEndDate).getTime() - new Date(task.plannedDate).getTime();
        newEndDate = new Date(newStartDate.getTime() + durationMs);
      }

      const originalTasks = [...localTasks];
      setLocalTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            return { ...t, plannedDate: newStartDate, plannedEndDate: newEndDate };
          }
          return t;
        }),
      );

      const result = await updateTaskRangeAction(
        taskId,
        newStartDate.toISOString(),
        newEndDate?.toISOString() ?? null,
      );
      if (result.success) {
        toast.success(`Moved to ${format(parseISO(newDateStr), "MMM d")}`);
      } else {
        setLocalTasks(originalTasks);
        toast.error(result.error || "Failed to move task");
      }
    }
  };

  const handleResize = async (taskId: string, daysDelta: number) => {
    const originalTask = localTasks.find((t) => t.id === taskId);
    if (!originalTask || !originalTask.plannedDate) return;

    const currentStart = new Date(originalTask.plannedDate);
    const currentEnd = originalTask.plannedEndDate
      ? new Date(originalTask.plannedEndDate)
      : new Date(currentStart);

    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + daysDelta);

    const startTs = new Date(currentStart).setHours(0, 0, 0, 0);
    const newEndTs = new Date(newEnd).setHours(0, 0, 0, 0);

    if (newEndTs < startTs) return;

    const isSameDayVal = startTs === newEndTs;
    const finalEnd = isSameDayVal ? null : newEnd;

    const originalTasks = [...localTasks];
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, plannedDate: currentStart, plannedEndDate: finalEnd } : t,
      ),
    );

    const result = await updateTaskRangeAction(
      taskId,
      currentStart.toISOString(),
      finalEnd?.toISOString() ?? null,
    );
    if (result.success) {
      toast.success("Task duration updated");
    } else {
      setLocalTasks(originalTasks);
      toast.error(result.error || "Failed to update task duration");
    }
  };

  const navigate = (direction: number) => {
    if (mode === "month") {
      setCurrentDate((prev) => (direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1)));
    } else if (mode === "week") {
      setCurrentDate((prev) => (direction > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1)));
    } else {
      setCurrentDate((prev) => (direction > 0 ? addDays(prev, 1) : subDays(prev, 1)));
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
    const baseTop = mode === "month" ? 64 : 74;
    const padding = 8;
    const minCellHeightVal = minCellHeight ?? (mode === "month" ? 200 : 500);

    const rowCount = Math.ceil(days.length / 7);

    for (let r = 0; r < rowCount; r++) {
      let total = baseTop;
      const rowSegments = allTasksWithLevels.filter((s) => s.rowIdx === r);
      const maxLevel = rowSegments.length > 0 ? Math.max(...rowSegments.map((s) => s.level)) : -1;

      if (maxLevel >= 0) {
        const rowMaxHeight = maxTaskHeightForRow(r);
        total += (maxLevel + 1) * (rowMaxHeight + padding);
      }
      heights[r] = Math.max(minCellHeightVal, total);
    }

    return heights;
  }, [allTasksWithLevels, maxTaskHeightForRow, mode, days.length, minCellHeight]);

  const deadlinesByDayIndex = useMemo(() => {
    const map: Record<number, TaskData[]> = {};
    projectTasks.forEach((task) => {
      if (!task.dueDate) return;
      const idx = days.findIndex((d) => isSameDay(d, new Date(task.dueDate!)));
      if (idx >= 0) {
        if (!map[idx]) map[idx] = [];
        map[idx].push(task);
      }
    });
    return map;
  }, [projectTasks, days]);

  const tasksByDayIndex = useMemo(() => {
    const map: Record<number, TaskData[]> = {};
    calendarTasks.forEach((task) => {
      if (!task.plannedDate) return;
      const taskDate = new Date(task.plannedDate);
      const idx = days.findIndex((d) => isSameDay(d, taskDate));
      if (idx >= 0) {
        if (!map[idx]) map[idx] = [];
        map[idx].push(task);
      }
    });
    return map;
  }, [calendarTasks, days]);

  const navButtonClass =
    "p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors";
  const todayButtonClass =
    "px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors";

  const headerTitle =
    mode === "day"
      ? format(currentDate, "MMMM d, yyyy")
      : mode === "month"
        ? format(currentDate, "MMMM yyyy")
        : format(currentDate, "'Week' w, MMMM yyyy");
  const headerSubtitle =
    mode === "month" ? "Monthly overview" : mode === "week" ? "Weekly focus" : "Daily timeline";

  const renderGridBody = () => (
    <div className="flex flex-col rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.02]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-label text-center py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="flex flex-col">
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
                    setDialogVersion((v) => v + 1);
                    setDialogOpen(true);
                  }}
                  isDraggingAny={isDraggingAny}
                  mode={mode}
                  tasksForDay={tasksByDayIndex[weekIdx * 7 + dayIdx] || []}
                  minHeight={rowHeights[weekIdx]}
                />
              ))}
            </div>

            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
              {days.slice(weekIdx * 7, weekIdx * 7 + 7).map((_, dayOffset) => {
                const globalIdx = weekIdx * 7 + dayOffset;
                const deadlines = deadlinesByDayIndex[globalIdx];
                if (!deadlines?.length) return null;
                return deadlines.map((task, di) => {
                  const isOverdue =
                    isBefore(new Date(task.dueDate!), new Date()) && task.status !== "DONE";
                  const Icon = task.icon ? ALL_ICONS[task.icon] : null;
                  const deadlineClass = `pointer-events-auto absolute flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium truncate max-w-[90%] ${
                    isOverdue ? "bg-rose-500/15 text-rose-400" : "bg-white/10 text-zinc-300"
                  }`;

                  return (
                    <button
                      key={`deadline-${task.id}`}
                      onClick={() => handleEdit(task)}
                      className={deadlineClass}
                      style={{ gridColumnStart: dayOffset + 1, top: 4 + di * 20 }}
                    >
                      <Flag size={8} className="shrink-0" />
                      {Icon && <Icon size={8} className="shrink-0" />}
                      <span className="truncate">{task.isPrivate ? "Private" : task.title}</span>
                    </button>
                  );
                });
              })}

              {allTasksWithLevels
                .filter((seg) => seg.rowIdx === weekIdx)
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
                    fixedHeight={maxTaskHeightForRow(weekIdx)}
                    style={{ top: calculateTop(seg.level, seg.rowIdx), pointerEvents: "auto" }}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col">
        {!hideControls && (
          <div className="flex flex-col gap-3 mb-4">
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h2 className="text-panel-title">{headerTitle}</h2>
                  <p className="text-caption">{headerSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <button onClick={() => navigate(-1)} title="Previous" className={navButtonClass}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className={todayButtonClass}>
                  Today
                </button>
                <button onClick={() => navigate(1)} title="Next" className={navButtonClass}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex md:hidden items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <button onClick={() => navigate(-1)} className={navButtonClass}>
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className={todayButtonClass}>
                  Today
                </button>
                <button onClick={() => navigate(1)} className={navButtonClass}>
                  <ChevronRight size={14} />
                </button>
              </div>

              {!hideModeSwitch && (
                <div className="relative flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  {["month", "week", "day"].map((id) => {
                    const isActive = mode === id;
                    const modeButtonClass = `relative px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors duration-150 ${
                      isActive ? "text-white" : "text-zinc-400 hover:text-zinc-100"
                    }`;

                    return (
                      <button
                        key={id}
                        onClick={() => setMode(id as "month" | "week" | "day")}
                        className={modeButtonClass}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeViewTab"
                            className="absolute inset-0 bg-accent rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative">{id}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {projectTasks.length > 0 && (
          <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1">
            <span className="text-label shrink-0">Projects</span>
            <div className="flex items-center gap-2">
              {projectTasks.map((task) => {
                const completed = task.children.filter((c) => c.status === "DONE").length;
                const total = task.children.length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                const isOverdue =
                  task.dueDate &&
                  isBefore(new Date(task.dueDate), new Date()) &&
                  task.status !== "DONE";
                const Icon = task.icon ? ALL_ICONS[task.icon] : null;
                const dueDateClass = `flex items-center gap-1 text-[10px] ${isOverdue ? "text-rose-400" : "text-zinc-500"}`;

                return (
                  <button
                    key={task.id}
                    onClick={() => handleEdit(task)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card shrink-0 hover:border-white/[0.12] transition-colors"
                  >
                    {task.sphere && (
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: task.sphere.color }}
                      />
                    )}
                    {Icon && <Icon size={11} className="text-zinc-400 shrink-0" />}
                    <span className="text-xs font-medium text-zinc-200 whitespace-nowrap">
                      {task.isPrivate ? "Private" : task.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {completed}/{total}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div className={dueDateClass}>
                        <Flag size={9} />
                        <span>{format(new Date(task.dueDate), "MMM d")}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          {mode === "day" ? (
            <div className="flex flex-col gap-3">
              {unscheduledTasks.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-label shrink-0">Unscheduled</span>
                  {unscheduledTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleEdit(task)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] shrink-0 hover:bg-white/5 transition-colors"
                    >
                      {task.icon &&
                        ALL_ICONS[task.icon] &&
                        React.createElement(ALL_ICONS[task.icon], {
                          size: 10,
                          className: "text-accent/50 shrink-0",
                        })}
                      <span className="text-xs text-zinc-300 whitespace-nowrap">
                        {task.isPrivate ? "Private" : task.title}
                      </span>
                      {task.sphere && (
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: task.sphere.color }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div
                ref={timelineContainerRef}
                className="overflow-x-auto rounded-2xl border border-white/[0.06]"
              >
                <div className="relative" style={{ width: TOTAL_WIDTH }}>
                  <div className="flex border-b border-white/[0.06]">
                    {hours.map((hour, i) => (
                      <div
                        key={i}
                        className="flex items-center border-r border-white/[0.04] py-2 shrink-0"
                        style={{ width: HOUR_WIDTH }}
                      >
                        <span className="text-[10px] font-mono text-zinc-500 pl-2">
                          {format(hour, "HH:mm")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 flex pointer-events-none">
                    {hours.map((_, i) => (
                      <div
                        key={i}
                        className="border-r border-white/[0.03] relative shrink-0"
                        style={{ width: HOUR_WIDTH }}
                      >
                        <div className="absolute left-1/4 top-0 bottom-0 border-r border-white/[0.02]" />
                        <div className="absolute left-1/2 top-0 bottom-0 border-r border-white/[0.02]" />
                        <div className="absolute left-3/4 top-0 bottom-0 border-r border-white/[0.02]" />
                      </div>
                    ))}
                  </div>

                  {isToday(currentDate) &&
                    (() => {
                      const nowMin = now.getHours() * 60 + now.getMinutes();
                      const dayStartMin = DAY_START * 60;
                      if (nowMin >= dayStartMin && nowMin <= DAY_END * 60) {
                        const nowLeft = ((nowMin - dayStartMin) / 60) * HOUR_WIDTH;
                        return (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-rose-500 z-20"
                            style={{ left: nowLeft }}
                          >
                            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-rose-500" />
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
                    <div className="relative pt-4 pb-6" style={{ minHeight: 200 }}>
                      {timelineRows.map((rowTasks, rowIdx) => (
                        <div key={rowIdx} className="relative h-20 mb-2">
                          {rowTasks.map((task) => {
                            const isResizingThis = resizingTimeline?.id === task.id;
                            const isDraggingThis = draggingTimeline?.id === task.id;

                            const resDelta = isResizingThis
                              ? Math.round(resizingTimeline!.delta / 5) * 5
                              : 0;
                            const drgDelta = isDraggingThis
                              ? Math.round(((draggingTimeline!.deltaX / HOUR_WIDTH) * 60) / 5) * 5
                              : 0;

                            let start = new Date(task.plannedDate!);
                            let end = task.plannedEndDate
                              ? new Date(task.plannedEndDate)
                              : addMinutes(start, 60);

                            if (isResizingThis) {
                              if (resizingTimeline!.edge === "start") {
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
                                style={{ left: leftPos, width: widthVal }}
                              >
                                <div
                                  className="w-full h-full rounded-lg glass-card px-2.5 py-1.5 flex flex-col justify-center cursor-pointer overflow-hidden"
                                  onClick={() => {
                                    if (!isDraggingAny) handleEdit(task);
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {format(start, "HH:mm")} — {format(end, "HH:mm")}
                                    </span>
                                    {task.icon &&
                                      ALL_ICONS[task.icon] &&
                                      React.createElement(ALL_ICONS[task.icon], {
                                        size: 10,
                                        className: "text-zinc-500 shrink-0",
                                      })}
                                  </div>

                                  <h4 className="text-xs font-medium text-zinc-100 truncate">
                                    {task.title}
                                  </h4>

                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <StatusToggle
                                        taskId={task.id}
                                        status={task.status}
                                        variant="badge"
                                        size="sm"
                                        onStatusChange={handleTaskStatusChange}
                                      />
                                    </div>

                                    <div className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />

                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {task.isFrog && (
                                        <span className="text-[9px]">
                                          <span role="img" aria-label="frog">
                                            🐸
                                          </span>
                                        </span>
                                      )}
                                      {task.sphere && (
                                        <div className="flex items-center gap-1">
                                          <div
                                            className="w-1.5 h-1.5 rounded-full shrink-0"
                                            style={{ backgroundColor: task.sphere.color }}
                                          />
                                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">
                                            {task.sphere.name}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        {React.createElement(pCfg.icon, {
                                          size: 10,
                                          style: { color: pCfg.color },
                                        })}
                                        <span
                                          className="text-[9px] font-mono uppercase tracking-wide"
                                          style={{ color: pCfg.color }}
                                        >
                                          {pCfg.label}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="absolute top-0 right-0 bottom-0 w-1.5 cursor-ew-resize flex items-center justify-center"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const sX = e.clientX;

                                    const hMouseMove = (mv: MouseEvent) => {
                                      const dX = mv.clientX - sX;
                                      const minDelta = (dX / HOUR_WIDTH) * 60;
                                      setResizingTimeline({
                                        id: task.id,
                                        delta: minDelta,
                                        edge: "end",
                                      });
                                    };

                                    const hMouseUp = (ev: MouseEvent) => {
                                      document.removeEventListener("mousemove", hMouseMove);
                                      document.removeEventListener("mouseup", hMouseUp);

                                      const dX = ev.clientX - sX;
                                      const minDelta = Math.round(((dX / HOUR_WIDTH) * 60) / 5) * 5;

                                      if (minDelta !== 0) {
                                        const cDur = differenceInMinutes(end, start);
                                        if (cDur + minDelta < 60) {
                                          handleTimelineResize(task.id, 60 - cDur, "end");
                                        } else {
                                          handleTimelineResize(task.id, minDelta, "end");
                                        }
                                      }
                                      setResizingTimeline(null);
                                    };

                                    document.addEventListener("mousemove", hMouseMove);
                                    document.addEventListener("mouseup", hMouseUp);
                                  }}
                                >
                                  <div className="w-0.5 h-1/2 rounded-full bg-white/20 hover:bg-accent transition-colors" />
                                </div>
                              </DayTimelineCardWrapper>
                            );
                          })}
                        </div>
                      ))}

                      {timelineRows.length === 0 && unscheduledTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-600">
                          <Clock size={48} strokeWidth={1} />
                          <p className="text-caption">No tasks scheduled for this day</p>
                        </div>
                      )}
                    </div>
                  </DndContext>
                </div>
              </div>
            </div>
          ) : (
            renderGridBody()
          )}
        </div>
      </div>

      <TaskFormDialog
        key={`task-form-${dialogVersion}-${editingTask?.id ?? "new"}`}
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={(savedTask) => {
          setLocalTasks((prev) => {
            const existing = prev.find((t) => t.id === savedTask.id);
            if (existing) {
              return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
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
