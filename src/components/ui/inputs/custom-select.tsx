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
    <div ref={triggerRef} >
      <button
        type="button"
        onClick={() => !disabled && open()}
        disabled={disabled}

      >
        <div >
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <selectedOption.icon
                  size={16}

                  strokeWidth={2.5}
                />
              )}
              <span >
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span >{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} />
      </button>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={contentRef}

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

              >
                <div >
                  {option.icon && (
                    <option.icon
                      size={16}

                      strokeWidth={2.5}
                    />
                  )}
                  <span >
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
