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
} from "date-fns";
import { createPortal } from "react-dom";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  disabled,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(value ? parseISO(value) : new Date());
  const { isOpen, coords, triggerRef, contentRef, open, close } = useDynamicPositioning<
    HTMLDivElement,
    HTMLDivElement
  >({ contentHeight: 380, contentWidth: 280 });

  const selectedDate = value ? parseISO(value) : null;

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current?.contains(event.target as Node) ||
        contentRef.current?.contains(event.target as Node)
      )
        return;
      close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close, triggerRef, contentRef]);

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handleDateSelect = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
    close();
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange("");
  };

  const triggerClass = `glass-input flex items-center justify-between gap-2 w-full px-3 py-2 text-sm transition-all duration-150 ${
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  } ${isOpen ? "border-accent bg-black/35 ring-2 ring-accent/20" : ""} ${className}`;
  const valueLabelClass = `truncate ${selectedDate ? "text-zinc-200" : "text-zinc-600"}`;
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
    <div ref={triggerRef}>
      <div onClick={() => !disabled && open()} className={triggerClass}>
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon size={14} className="text-zinc-500 shrink-0" />
          <span className={valueLabelClass}>
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : placeholder}
          </span>
        </div>
        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={clearDate}
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
            ref={contentRef}
            style={dropdownStyle}
            onMouseDown={(e) => e.stopPropagation()}
            className="glass-elevated p-4 flex flex-col gap-3 z-[9000]"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-panel-title">{format(currentMonth, "MMMM yyyy")}</h4>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div key={i} className="text-label text-center py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                const dayClass = `h-8 w-8 flex items-center justify-center rounded-lg text-xs transition-colors duration-150 ${
                  isSelected
                    ? "bg-accent text-white font-semibold"
                    : isTodayDate
                      ? "text-accent font-semibold hover:bg-white/5"
                      : isCurrentMonth
                        ? "text-zinc-300 hover:bg-white/5"
                        : "text-zinc-700 hover:bg-white/5"
                }`;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={dayClass}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className="text-xs font-semibold text-accent hover:opacity-80 transition-opacity"
              >
                Today
              </button>
              <button
                type="button"
                onClick={close}
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
