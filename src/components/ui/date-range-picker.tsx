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
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string | null;   // ISO date string YYYY-MM-DD
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
      // Start new selection
      onChange(format(date, "yyyy-MM-dd"), null);
    } else {
      // Selection end date
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

  /* eslint-disable react-hooks/preserve-manual-memoization */
  const displayValue = React.useMemo(() => {
    if (!start) return "";
    if (!end) return format(start, "MMM d, yyyy");
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }, [start, end]);
  /* eslint-enable react-hooks/preserve-manual-memoization */

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={handleOpen}
        className={`flex items-center gap-3 px-4 py-2 bg-raised/50 border border-border rounded-xl cursor-pointer hover:border-accent/40 transition-all ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${isOpen ? "border-accent ring-2 ring-accent/10" : ""}`}
      >
        <CalendarIcon size={14} className={startDate ? "text-accent" : "text-muted"} />
        <span className={`text-[12px] flex-1 truncate ${!startDate ? "text-muted/50" : "text-text font-medium"}`}>
          {displayValue || placeholder}
        </span>
        {startDate && !disabled && (
          <button onClick={clear} className="p-1 hover:bg-surface rounded-md text-muted hover:text-text transition-colors">
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div 
          id="date-picker-portal"
          className={`fixed z-[9999] w-72 bg-surface border border-border rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 ${coords.align === 'top' ? 'origin-bottom' : 'origin-top'}`}
          style={{ 
            top: coords.align === 'top' ? 'auto' : coords.top,
            bottom: coords.align === 'top' ? (window.innerHeight - coords.top) : 'auto',
            left: coords.left
          }}
        >
          {/* Picker Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-raised rounded-lg text-muted hover:text-text transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[12px] font-bold uppercase tracking-wider">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-raised rounded-lg text-muted hover:text-text transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i} className="text-[10px] font-bold text-muted/40 text-center h-6 flex items-center justify-center">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
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
                  className={`
                    h-8 w-full rounded-lg text-[11px] font-mono transition-all flex items-center justify-center
                    ${!isCurrentMonth ? "opacity-0 pointer-events-none" : "hover:bg-accent/10"}
                    ${isSelectedStart || isSelectedEnd ? "bg-accent text-bg font-bold shadow-lg shadow-accent/20 scale-105 z-10" : ""}
                    ${inRange && !isSelectedStart && !isSelectedEnd ? "bg-accent/10 text-accent font-bold" : ""}
                    ${isToday(day) && !isSelectedStart && !isSelectedEnd ? "text-accent underline underline-offset-4 decoration-2" : ""}
                    ${!isSelectedStart && !isSelectedEnd && !inRange ? "text-secondary" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <button 
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                onChange(format(now, "yyyy-MM-dd"), null);
              }}
              className="text-[10px] font-bold text-accent uppercase tracking-wider hover:underline"
            >
              Today
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-muted uppercase tracking-wider hover:text-text"
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
