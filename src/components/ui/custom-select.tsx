"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";

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
  const { isOpen, coords, triggerRef, contentRef, open, close } =
    useDynamicPositioning<HTMLDivElement, HTMLDivElement>({ contentHeight: 250 });

  const selectedOption = options.find((o) => o.id === value);

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

  return (
    <div className={`relative ${className}`} ref={triggerRef} style={style}>
      <button
        type="button"
        onClick={() => !disabled && open()}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-2 text-body transition-all hover:border-accent/40 focus:ring-1 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border"
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
          ref={contentRef}
          className={`fixed z-[9999] rounded-2xl border border-border bg-surface p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 ${
            coords.align === "top" ? "origin-bottom" : "origin-top"
          }`}
          style={{
            top: coords.align === "top" ? "auto" : coords.top,
            bottom: coords.align === "top" ? window.innerHeight - coords.top + 16 : "auto",
            left: coords.left,
            width: triggerRef.current?.getBoundingClientRect().width,
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
                  close();
                }}
                className={`
                  flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-body transition-all group
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
