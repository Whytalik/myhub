"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X
} from "lucide-react";
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
  parseISO
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

export function DatePicker({ value, onChange, placeholder = "Select date", className = "", disabled }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(value ? parseISO(value) : new Date());
  const { isOpen, coords, triggerRef, contentRef, open, close } =
    useDynamicPositioning<HTMLDivElement, HTMLDivElement>({ contentHeight: 380, contentWidth: 280 });

  const selectedDate = value ? parseISO(value) : null;

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current?.contains(event.target as Node) ||
        contentRef.current?.contains(event.target as Node)
      ) return;
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

  return (
    <div ref={triggerRef}>
      <div
        onClick={() => !disabled && open()}

      >
        <div >
          <CalendarIcon size={14} />
          <span >
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : placeholder}
          </span>
        </div>
        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={clearDate}

          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={contentRef}

          onMouseDown={(e) => e.stopPropagation()}
        >
          <div >
            <h4 >
              {format(currentMonth, "MMMM yyyy")}
            </h4>
            <div >
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}

              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}

              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div >
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div key={i} >
                {day}
              </div>
            ))}
          </div>

          <div >
            {days.map((day, i) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDateSelect(day)}

                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div >
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}

            >
              Today
            </button>
            <button
              type="button"
              onClick={close}

            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
