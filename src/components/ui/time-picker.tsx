"use client";

import * as React from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({ value, onChange, className = "", disabled }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{ top: number, left: number, align: 'top' | 'bottom' } | null>(null);

  // Parse current value or default to 12:00
  const [hours, minutes] = React.useMemo(() => {
    if (!value) return [12, 0];
    const [h, m] = value.split(":").map(Number);
    return [isNaN(h) ? 12 : h, isNaN(m) ? 0 : m];
  }, [value]);

  const setHours = (h: number) => {
    const newH = (h + 24) % 24;
    onChange(`${newH.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
  };

  const setMinutes = (m: number) => {
    const newM = (m + 60) % 60;
    onChange(`${hours.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`);
  };

  const updateCoords = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const pickerHeight = 220; // Estimated height of the time picker

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
        const portal = document.getElementById("time-picker-portal");
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

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={handleOpen}
        className={`flex h-9 w-full items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-2 text-[13px] transition-all focus-within:ring-1 focus-within:ring-accent ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-accent/40"}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Clock size={14} className={value ? "text-accent" : "text-muted"} />
          <span className={value ? "text-text font-mono font-bold" : "text-muted font-mono"}>
            {value || "12:00"}
          </span>
        </div>
      </div>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div 
          id="time-picker-portal"
          className={`fixed z-[9999] w-[180px] rounded-2xl border border-border bg-surface p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 ${
            coords.align === 'top' ? 'origin-bottom' : 'origin-top'
          }`}
          style={{ 
            top: coords.align === 'top' ? 'auto' : coords.top,
            bottom: coords.align === 'top' ? (window.innerHeight - coords.top + 16) : 'auto',
            left: Math.min(coords.left, window.innerWidth - 190) 
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => setHours(hours + 1)}
                className="p-1 hover:bg-raised rounded-lg text-muted hover:text-accent transition-all"
              >
                <ChevronUp size={16} />
              </button>
              <div className="w-12 h-12 flex items-center justify-center bg-raised/50 border border-border/50 rounded-xl text-lg font-mono font-bold text-text">
                {hours.toString().padStart(2, "0")}
              </div>
              <button 
                onClick={() => setHours(hours - 1)}
                className="p-1 hover:bg-raised rounded-lg text-muted hover:text-accent transition-all"
              >
                <ChevronDown size={16} />
              </button>
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted mt-1">Hrs</span>
            </div>

            <div className="text-xl font-bold text-muted pb-6">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => setMinutes(minutes + 5)}
                className="p-1 hover:bg-raised rounded-lg text-muted hover:text-accent transition-all"
              >
                <ChevronUp size={16} />
              </button>
              <div className="w-12 h-12 flex items-center justify-center bg-raised/50 border border-border/50 rounded-xl text-lg font-mono font-bold text-text">
                {minutes.toString().padStart(2, "0")}
              </div>
              <button 
                onClick={() => setMinutes(minutes - 5)}
                className="p-1 hover:bg-raised rounded-lg text-muted hover:text-accent transition-all"
              >
                <ChevronDown size={16} />
              </button>
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted mt-1">Min</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex justify-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-mono uppercase tracking-widest text-accent hover:text-accent/80 font-bold"
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
