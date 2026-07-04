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
  parseISO,
  isWithinInterval,
  isBefore
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
  disabled
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(startDate ? parseISO(startDate) : new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{ top: number, left: number, align: 'top' | 'bottom' } | null>(null);

  const start = startDate ? parseISO(startDate) : null;
  const end = endDate ? parseISO(endDate) : null;

  const updateCoords = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const pickerHeight = 380;

      if (spaceBelow < pickerHeight && rect.top > pickerHeight) {
        setCoords({
          top: rect.top - 8,
          left: rect.left,
          align: 'top'
        });
      } else {
        setCoords({
          top: rect.bottom + 8,
          left: rect.left,
          align: 'bottom'
        });
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
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
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


  const displayValue = React.useMemo(() => {
    if (!start) return "";
    if (!end) return format(start, "MMM d, yyyy");
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }, [start, end]);


  return (
    <div ref={containerRef}>
      <div
        onClick={handleOpen}

      >
        <CalendarIcon size={14} />
        <span >
          {displayValue || placeholder}
        </span>
        {startDate && !disabled && (
          <button onClick={clear} >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          id="date-picker-portal"


        >
          {}
          <div >
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}

            >
              <ChevronLeft size={16} />
            </button>
            <span >
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}

            >
              <ChevronRight size={16} />
            </button>
          </div>

          {}
          <div >
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i} >
                {day}
              </span>
            ))}
          </div>

          {}
          <div >
            {days.map((day, i) => {
              const isSelectedStart = start && isSameDay(day, start);
              const isSelectedEnd = end && isSameDay(day, end);
              const inRange = isInRange(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(day)}
                  disabled={!isCurrentMonth}

                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div >
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                onChange(format(now, "yyyy-MM-dd"), null);
              }}

            >
              Today
            </button>
            <button
              onClick={() => setIsOpen(false)}

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
