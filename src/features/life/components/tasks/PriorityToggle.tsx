"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { updateTaskPriorityAction } from "@/features/life/actions/task-actions";
import type { TaskPriority } from "@/features/life/types";
import { PRIORITY_CONFIG } from "./PriorityBadge";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
import { createPortal } from "react-dom";

interface PriorityToggleProps {
  taskId: string;
  priority: TaskPriority;
  size?: "sm" | "default";
}

export function PriorityToggle({
  taskId,
  priority: initialPriority,
  size = "default",
}: PriorityToggleProps) {
  const [currentPriority, setCurrentPriority] = useState<TaskPriority>(initialPriority);
  const [isPending, startTransition] = useTransition();

  const { isOpen, coords, triggerRef, contentRef, toggle, close } =
    useDynamicPositioning<HTMLButtonElement>({
      contentWidth: 160,
      offset: 8,
    });

  const handlePrioritySelect = (newPriority: TaskPriority) => {
    if (newPriority === currentPriority) {
      close();
      return;
    }

    setCurrentPriority(newPriority);
    close();

    startTransition(async () => {
      const result = await updateTaskPriorityAction(taskId, newPriority);
      if (!result.success) {
        setCurrentPriority(initialPriority);
        toast.error(result.error || "Failed to update priority");
      }
    });
  };

  const config = PRIORITY_CONFIG[currentPriority];
  const Icon = config.icon;
  const isCompact = size === "sm";
  const triggerClass = `inline-flex items-center gap-1 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide transition-opacity duration-150 ${
    isCompact ? "px-1 py-0.5" : "px-1.5 py-0.5"
  } ${config.style} ${isPending ? "opacity-50" : ""}`;
  const dropdownStyle: React.CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.left,
        top: coords.align === "bottom" ? coords.top : undefined,
        bottom: coords.align === "top" ? window.innerHeight - coords.top : undefined,
        width: 160,
      }
    : {};

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button ref={triggerRef} onClick={toggle} disabled={isPending} className={triggerClass}>
        <Icon size={isCompact ? 8 : 10} strokeWidth={3} />
        {config.label}
        {!isCompact && <ChevronDown size={8} />}
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={contentRef as React.RefObject<HTMLDivElement>}
            style={dropdownStyle}
            onClick={(e) => e.stopPropagation()}
            className="glass-elevated p-1.5 flex flex-col gap-0.5 z-[9000]"
          >
            {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => {
              const cfg = PRIORITY_CONFIG[p];
              const PIcon = cfg.icon;
              const active = p === currentPriority;
              const optionClass = `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-left transition-colors duration-150 ${
                active
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`;
              const iconWrapClass = `flex items-center justify-center w-5 h-5 rounded ${cfg.style}`;

              return (
                <button key={p} onClick={() => handlePrioritySelect(p)} className={optionClass}>
                  <div className={iconWrapClass}>
                    <PIcon size={10} strokeWidth={3} />
                  </div>
                  {cfg.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
