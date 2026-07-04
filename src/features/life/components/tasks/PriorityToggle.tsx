"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown
} from "lucide-react";
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

export function PriorityToggle({ taskId, priority: initialPriority, size = "default" }: PriorityToggleProps) {
  const [currentPriority, setCurrentPriority] = useState<TaskPriority>(initialPriority);
  const [isPending, startTransition] = useTransition();

  const { isOpen, coords, triggerRef, contentRef, toggle, close } = useDynamicPositioning<HTMLButtonElement>({
    contentWidth: 160,
    offset: 8
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

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        onClick={toggle}
        disabled={isPending}


      >
        <Icon size={isCompact ? 6 : 10} strokeWidth={3} />
        {config.label}
        {!isCompact && <ChevronDown size={8} />}
      </button>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={contentRef as React.RefObject<HTMLDivElement>}


        >
          <div >
            {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => {
              const cfg = PRIORITY_CONFIG[p];
              const PIcon = cfg.icon;
              const active = p === currentPriority;

              return (
                <button
                  key={p}
                  onClick={() => handlePrioritySelect(p)}

                >
                  <div


                  >
                    <PIcon size={10} strokeWidth={3} />
                  </div>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
