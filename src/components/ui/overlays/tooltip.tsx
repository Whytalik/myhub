"use client";

import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";

interface HintTooltipProps {
  hint: string;
  iconSize?: number;
}

const TOOLTIP_WIDTH = 260;

export function HintTooltip({ hint, iconSize = 12 }: HintTooltipProps) {
  const { isOpen, coords, triggerRef, contentRef, open, close, toggle } = useDynamicPositioning<
    HTMLButtonElement,
    HTMLDivElement
  >({
    contentWidth: TOOLTIP_WIDTH,
    offset: 6,
  });

  const triggerClass =
    "inline-flex items-center text-zinc-600 hover:text-zinc-300 focus-visible:text-zinc-300 outline-none transition-colors duration-150";
  const panelClass = "glass-elevated px-3 py-2 text-caption leading-relaxed z-[9000]";
  const panelStyle: React.CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.left,
        top: coords.align === "bottom" ? coords.top : undefined,
        bottom: coords.align === "top" ? window.innerHeight - coords.top : undefined,
        width: TOOLTIP_WIDTH,
      }
    : {};

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Hint"
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onClick={toggle}
        className={triggerClass}
      >
        <CircleHelp size={iconSize} />
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div ref={contentRef} style={panelStyle} className={panelClass}>
            {hint}
          </div>,
          document.body,
        )}
    </>
  );
}
