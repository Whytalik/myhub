"use client";

import * as React from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  presets?: { label: string; value: string }[];
}

export function TimePicker({
  value,
  onChange,
  className = "",
  disabled,
  presets,
}: TimePickerProps) {
  const { isOpen, coords, triggerRef, contentRef, open, close } = useDynamicPositioning<
    HTMLDivElement,
    HTMLDivElement
  >({ contentHeight: presets ? 300 : 220, contentWidth: 180 });

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
      )
        return;
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

  const triggerClass = `glass-input flex items-center gap-2 w-full px-3 py-2 text-sm transition-all duration-150 ${
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  } ${isOpen ? "border-accent bg-black/35 ring-2 ring-accent/20" : ""} ${className}`;
  const stepperButtonClass =
    "p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors";
  const dropdownStyle: React.CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.left,
        width: 180,
        ...(coords.align === "bottom"
          ? { top: coords.top }
          : { bottom: window.innerHeight - coords.top }),
      }
    : {};

  return (
    <div ref={triggerRef}>
      <div onClick={() => !disabled && open()} className={triggerClass}>
        <Clock size={14} className="text-zinc-500 shrink-0" />
        <span className={`font-mono ${value ? "text-zinc-200" : "text-zinc-600"}`}>
          {value || "--:--"}
        </span>
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
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHours(hours + 1)}
                  className={stepperButtonClass}
                >
                  <ChevronUp size={16} />
                </button>
                <div className="font-mono text-2xl font-semibold text-zinc-100 tabular-nums w-10 text-center">
                  {hours.toString().padStart(2, "0")}
                </div>
                <button
                  type="button"
                  onClick={() => setHours(hours - 1)}
                  className={stepperButtonClass}
                >
                  <ChevronDown size={16} />
                </button>
                <span className="text-label">Hrs</span>
              </div>

              <div className="font-mono text-2xl font-semibold text-zinc-500 pb-6">:</div>

              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMinutes(minutes + 5)}
                  className={stepperButtonClass}
                >
                  <ChevronUp size={16} />
                </button>
                <div className="font-mono text-2xl font-semibold text-zinc-100 tabular-nums w-10 text-center">
                  {minutes.toString().padStart(2, "0")}
                </div>
                <button
                  type="button"
                  onClick={() => setMinutes(minutes - 5)}
                  className={stepperButtonClass}
                >
                  <ChevronDown size={16} />
                </button>
                <span className="text-label">Min</span>
              </div>
            </div>

            {presets && presets.length > 0 && (
              <div className="flex flex-col gap-0.5 pt-2 border-t border-white/[0.06]">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      onChange(preset.value);
                      close();
                    }}
                    className="px-2 py-1.5 rounded-lg text-sm text-left text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={close}
                className="text-xs font-semibold text-accent hover:opacity-80 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
