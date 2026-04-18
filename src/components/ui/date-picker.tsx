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

interface DatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Select date", className = "", disabled }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value ? parseISO(value) : new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{ top: number, left: number, align: 'top' | 'bottom' } | null>(null);

  const selectedDate = value ? parseISO(value) : null;

  const updateCoords = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const pickerHeight = 380; // Estimated height of the date picker

      if (spaceBelow < pickerHeight && rect.top > pickerHeight) {
        // Not enough space below, but enough above
        setCoords({
          top: rect.top - 8,
          left: rect.left,
          align: 'top'
        });
      } else {
        // Default to below
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
    onChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={handleOpen}
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-2 text-[13px] transition-all focus-within:ring-1 focus-within:ring-accent ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-accent/40"}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon size={14} className={selectedDate ? "text-accent" : "text-muted"} />
          <span className={selectedDate ? "text-text font-bold" : "text-muted"}>
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : placeholder}
          </span>
        </div>
        {selectedDate && !disabled && (
          <button 
            onClick={clearDate}
            className="p-1 hover:bg-raised rounded-md text-muted hover:text-text transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div 
          id="date-picker-portal"
          className={`fixed z-[9999] w-[280px] rounded-2xl border border-border bg-surface p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 ${
            coords.align === 'top' ? 'origin-bottom' : 'origin-top'
          }`}
          style={{ 
            top: coords.align === 'top' ? 'auto' : coords.top,
            bottom: coords.align === 'top' ? (window.innerHeight - coords.top + 16) : 'auto',
            left: Math.min(coords.left, window.innerWidth - 300) 
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-text">
              {format(currentMonth, "MMMM yyyy")}
            </h4>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 hover:bg-raised rounded-lg text-muted hover:text-text transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 hover:bg-raised rounded-lg text-muted hover:text-text transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div key={i} className="text-center text-[10px] font-mono font-bold text-muted/60 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(day)}
                  className={`
                    h-8 w-full rounded-lg text-[11px] font-mono transition-all flex items-center justify-center
                    ${isSelected ? "bg-accent text-bg font-bold" : "hover:bg-raised text-secondary hover:text-text"}
                    ${!isCurrentMonth && !isSelected ? "opacity-20" : ""}
                    ${isTodayDate && !isSelected ? "border border-accent/40 text-accent" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex justify-between gap-2">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="text-[10px] font-mono uppercase tracking-wider text-accent hover:underline font-bold"
            >
              Today
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-mono uppercase tracking-wider text-muted hover:text-text"
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
