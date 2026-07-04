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
    <div ref={triggerRef}>
      <div
        onClick={() => !disabled && open()}

      >
        <div >
          <Clock size={14} />
          <span >
            {value || "12:00"}
          </span>
        </div>
      </div>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={contentRef}

          onMouseDown={(e) => e.stopPropagation()}
        >
          <div >
            <div >
              <button
                type="button"
                onClick={() => setHours(hours + 1)}

              >
                <ChevronUp size={16} />
              </button>
              <div >
                {hours.toString().padStart(2, "0")}
              </div>
              <button
                type="button"
                onClick={() => setHours(hours - 1)}

              >
                <ChevronDown size={16} />
              </button>
              <span >Hrs</span>
            </div>

            <div >:</div>

            <div >
              <button
                type="button"
                onClick={() => setMinutes(minutes + 5)}

              >
                <ChevronUp size={16} />
              </button>
              <div >
                {minutes.toString().padStart(2, "0")}
              </div>
              <button
                type="button"
                onClick={() => setMinutes(minutes - 5)}

              >
                <ChevronDown size={16} />
              </button>
              <span >Min</span>
            </div>
          </div>

          {presets && presets.length > 0 && (
            <div >
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onChange(preset.value);
                    close();
                  }}

                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <div >
            <button
              type="button"
              onClick={close}

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
