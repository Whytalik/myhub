"use client";

import * as React from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  presets?: { label: string; value: string }[];
}

export function TimePicker({ value, onChange, className = "", disabled, presets }: TimePickerProps) {
  const { isOpen, coords, triggerRef, contentRef, open, close } =
    useDynamicPositioning<HTMLDivElement, HTMLDivElement>({ contentHeight: presets ? 300 : 220, contentWidth: 180 });

  const [hours, minutes] = React.useMemo(() => {
    if (!value) return [12, 0];
    const [h, m] = value.split(":").map(Number);
    return [isNaN(h) ? 12 : h, isNaN(m) ? 0 : m];
  }, [value]);

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

  const setHours = (h: number) => {
    const newH = (h + 24) % 24;
    onChange(`${newH.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
  };

  const setMinutes = (m: number) => {
    const snappedM = Math.round(m / 5) * 5;
    const newM = (snappedM + 60) % 60;
    onChange(`${hours.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`);
  };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <div
        onClick={() => !disabled && open()}
        className={`flex h-9 w-full items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-2 text-body transition-all focus-within:ring-1 focus-within:ring-accent ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-accent/40"}`}
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
          ref={contentRef}
          className={`fixed z-[9999] w-[180px] rounded-2xl border border-border bg-surface p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 ${
            coords.align === "top" ? "origin-bottom" : "origin-top"
          }`}
          style={{
            top: coords.align === "top" ? "auto" : coords.top,
            bottom: coords.align === "top" ? window.innerHeight - coords.top + 16 : "auto",
            left: coords.left,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setHours(hours + 1)}
                className="p-1 hover:bg-raised rounded-lg text-muted hover:text-accent transition-all"
              >
                <ChevronUp size={16} />
              </button>
              <div className="w-10 h-10 flex items-center justify-center bg-raised/50 border border-border/50 rounded-xl text-base font-mono font-bold text-text">
                {hours.toString().padStart(2, "0")}
              </div>
              <button
                type="button"
                onClick={() => setHours(hours - 1)}
                className="p-1 hover:bg-raised rounded-lg text-muted hover:text-accent transition-all"
              >
                <ChevronDown size={16} />
              </button>
              <span className="text-label font-mono uppercase tracking-widest text-muted mt-1">Hrs</span>
            </div>

            <div className="text-base font-bold text-muted pb-6">:</div>

            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setMinutes(minutes + 5)}
                className="p-1 hover:bg-raised rounded-lg text-muted hover:text-accent transition-all"
              >
                <ChevronUp size={16} />
              </button>
              <div className="w-10 h-10 flex items-center justify-center bg-raised/50 border border-border/50 rounded-xl text-base font-mono font-bold text-text">
                {minutes.toString().padStart(2, "0")}
              </div>
              <button
                type="button"
                onClick={() => setMinutes(minutes - 5)}
                className="p-1 hover:bg-raised rounded-lg text-muted hover:text-accent transition-all"
              >
                <ChevronDown size={16} />
              </button>
              <span className="text-label font-mono uppercase tracking-widest text-muted mt-1">Min</span>
            </div>
          </div>

          {presets && presets.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/40 grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onChange(preset.value);
                    close();
                  }}
                  className="text-caption font-mono uppercase tracking-widest text-text-secondary hover:text-accent hover:bg-raised p-2 rounded-lg transition-all border border-border/40"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-border/40 flex justify-center">
            <button
              type="button"
              onClick={close}
              className="text-caption font-mono uppercase tracking-widest text-accent hover:text-accent/80 font-bold"
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
