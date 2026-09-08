"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import type { TaskData } from "@/features/life/types";

export function CalendarDayCell({
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
