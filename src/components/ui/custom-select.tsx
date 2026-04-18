"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";

export interface CustomSelectOption {
  id: string;
  label: string;
  icon?: React.ElementType;
  color?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
  style,
  disabled,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number; width: number; align: 'top' | 'bottom' } | null>(null);

  const selectedOption = options.find((o) => o.id === value);

  const updateCoords = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      
      // Select height varies by options, let's assume max 250px
      const menuHeight = Math.min(options.length * 45 + 10, 250);

      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setCoords({
          top: rect.top - 8,
          left: rect.left,
          width: rect.width,
          align: 'top'
        });
      } else {
        setCoords({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          align: 'bottom'
        });
      }
    }
  }, [options.length]);

  const handleOpen = () => {
    updateCoords();
    setIsOpen(true);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portal = document.getElementById("select-portal");
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
    <div className={`relative ${className}`} ref={containerRef} style={style}>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-2 text-[13px] transition-all hover:border-accent/40 focus:ring-1 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border"
        style={style}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <selectedOption.icon 
                  size={16} 
                  style={{ color: selectedOption.color || "var(--color-text)" }} 
                  strokeWidth={2.5}
                />
              )}
              <span className="font-bold text-text truncate">
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          id="select-portal"
          className={`fixed z-[9999] rounded-2xl border border-border bg-surface p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 ${
            coords.align === 'top' ? 'origin-bottom' : 'origin-top'
          }`}
          style={{
            top: coords.align === 'top' ? 'auto' : coords.top,
            bottom: coords.align === 'top' ? (window.innerHeight - coords.top + 16) : 'auto',
            left: coords.left,
            width: coords.width,
            maxHeight: "250px",
            overflowY: "auto",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`
                  flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all group
                  ${isSelected ? "bg-accent/10 text-accent font-bold" : "text-secondary hover:bg-raised hover:text-text"}
                `}
              >
                <div className="flex items-center gap-3">
                  {option.icon && (
                    <option.icon 
                      size={16} 
                      style={{ color: isSelected ? "var(--color-accent)" : option.color || "var(--color-muted)" }} 
                      strokeWidth={2.5}
                    />
                  )}
                  <span style={!isSelected ? { color: option.color } : undefined}>
                    {option.label}
                  </span>
                </div>
                {isSelected && <Check size={14} strokeWidth={3} />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
