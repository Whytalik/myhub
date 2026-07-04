"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  isWithinInterval,
  isBefore,
} from "date-fns";
import { createPortal } from "react-dom";

interface DateRangePickerProps {
  startDate: string;
  endDate: string | null;
  onChange: (start: string, end: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = "Select date range",
  className = "",
  disabled,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(
    startDate ? parseISO(startDate) : new Date(),
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{
    top: number;
    left: number;
    align: "top" | "bottom";
  } | null>(null);

  const start = startDate ? parseISO(startDate) : null;
  const end = endDate ? parseISO(endDate) : null;

  const updateCoords = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const pickerHeight = 380;

      if (spaceBelow < pickerHeight && rect.top > pickerHeight) {
        setCoords({ top: rect.top - 8, left: rect.left, align: "top" });
      } else {
        setCoords({ top: rect.bottom + 8, left: rect.left, align: "bottom" });
      }
    }
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    updateCoords();
    setIsOpen(true);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portal = document.getElementById("date-picker-portal");
        if (portal && portal.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, updateCoords]);

  const days = React.useMemo(() => {
    const weekStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentMonth]);

  const handleDateSelect = (date: Date) => {
    if (!start || (start && end)) {
      onChange(format(date, "yyyy-MM-dd"), null);
    } else {
      if (isBefore(date, start)) {
        onChange(format(date, "yyyy-MM-dd"), null);
      } else if (isSameDay(date, start)) {
        onChange(format(date, "yyyy-MM-dd"), null);
      } else {
        onChange(format(start, "yyyy-MM-dd"), format(date, "yyyy-MM-dd"));
        setIsOpen(false);
      }
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", null);
  };

  const isInRange = (date: Date) => {
    if (!start || !end) return false;
    return isWithinInterval(date, { start, end });
  };

  const displayValue = !start
    ? ""
    : !end
      ? format(start, "MMM d, yyyy")
      : `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;

  const triggerClass = `glass-input flex items-center gap-2 w-full px-3 py-2 text-sm transition-all duration-150 ${
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  } ${isOpen ? "border-accent bg-black/35 ring-2 ring-accent/20" : ""} ${className}`;
  const valueClass = `flex-1 truncate ${displayValue ? "text-zinc-200" : "text-zinc-600"}`;
  const dropdownStyle: React.CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.left,
        width: 280,
        ...(coords.align === "bottom"
          ? { top: coords.top }
          : { bottom: window.innerHeight - coords.top }),
      }
    : {};

  return (
    <div ref={containerRef}>
      <div onClick={handleOpen} className={triggerClass}>
        <CalendarIcon size={14} className="text-zinc-500 shrink-0" />
        <span className={valueClass}>{displayValue || placeholder}</span>
        {startDate && !disabled && (
          <button
            onClick={clear}
            className="text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="date-picker-portal"
            style={dropdownStyle}
            className="glass-elevated p-4 flex flex-col gap-3 z-[9000]"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-panel-title">{format(currentMonth, "MMMM yyyy")}</span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <span key={i} className="text-label text-center py-1">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const isSelectedStart = start && isSameDay(day, start);
                const isSelectedEnd = end && isSameDay(day, end);
                const inRange = isInRange(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                const isEndpoint = isSelectedStart || isSelectedEnd;
                const dayClass = `h-8 w-8 flex items-center justify-center rounded-lg text-xs transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${
                  isEndpoint
                    ? "bg-accent text-white font-semibold"
                    : inRange
                      ? "bg-accent/15 text-accent"
                      : isTodayDate
                        ? "text-accent font-semibold hover:bg-white/5"
                        : "text-zinc-300 hover:bg-white/5"
                }`;

                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(day)}
                    disabled={!isCurrentMonth}
                    className={dayClass}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(now);
                  onChange(format(now, "yyyy-MM-dd"), null);
                }}
                className="text-xs font-semibold text-accent hover:opacity-80 transition-opacity"
              >
                Today
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
