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
  const { isOpen, coords, triggerRef, contentRef, open, close } = useDynamicPositioning<
    HTMLDivElement,
    HTMLDivElement
  >({ contentHeight: 250 });

  const selectedOption = options.find((o) => o.id === value);

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

  const triggerClass = `glass-input flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-left transition-all duration-150 ${
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  } ${isOpen ? "border-accent bg-black/35 ring-2 ring-accent/20" : ""} ${className}`;
  const valueClass = selectedOption
    ? "flex items-center gap-2 text-zinc-200 truncate"
    : "text-zinc-600 truncate";
  const chevronClass = `text-zinc-500 shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`;
  const dropdownStyle: React.CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.left,
        width: coords.width,
        ...(coords.align === "bottom"
          ? { top: coords.top }
          : { bottom: window.innerHeight - coords.top }),
      }
    : {};

  return (
    <div ref={triggerRef} style={style}>
      <button
        type="button"
        onClick={() => !disabled && open()}
        disabled={disabled}
        className={triggerClass}
      >
        <div className={valueClass}>
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <selectedOption.icon size={16} className="shrink-0" strokeWidth={2.5} />
              )}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} className={chevronClass} />
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={contentRef}
            style={dropdownStyle}
            onMouseDown={(e) => e.stopPropagation()}
            className="glass-elevated p-1.5 flex flex-col gap-0.5 max-h-[250px] overflow-y-auto z-[9000]"
          >
            {options.map((option) => {
              const isSelected = option.id === value;
              const optionClass = `flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-sm text-left transition-colors duration-150 ${
                isSelected
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    close();
                  }}
                  className={optionClass}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <option.icon size={16} className="shrink-0" strokeWidth={2.5} />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check size={14} strokeWidth={3} className="shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
