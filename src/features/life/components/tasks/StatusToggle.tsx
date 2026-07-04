"use client";

import { useState, useTransition } from "react";
import {
  Check, Play, Circle, XCircle, HelpCircle,
  LucideIcon, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { updateTaskStatusAction } from "@/features/life/actions/task-actions";
import type { TaskStatus } from "@/features/life/types";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
import { createPortal } from "react-dom";

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  BACKLOG: "TODO",
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "BACKLOG",
  CANCELLED: "TODO",
};

export const STATUS_CONFIG: Record<TaskStatus, { style: string, icon: LucideIcon, label: string, color: string }> = {
  BACKLOG: {
    style: "",
    icon: HelpCircle,
    label: "Backlog",
    color: "#737373"
  },
  TODO: {
    style: "",
    icon: Circle,
    label: "Todo",
    color: "#a3a3a3"
  },
  IN_PROGRESS: {
    style: "",
    icon: Play,
    label: "In Progress",
    color: "#60a5fa"
  },
  DONE: {
    style: "",
    icon: Check,
    label: "Done",
    color: "#34d399"
  },
  CANCELLED: {
    style: "",
    icon: XCircle,
    label: "Cancelled",
    color: "#404040"
  },
};

interface StatusToggleProps {
  taskId: string;
  status: TaskStatus;
  variant?: "icon" | "badge";
  size?: "sm" | "default";
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

export function StatusToggle({ taskId, status: initialStatus, variant = "icon", size = "default", onStatusChange }: StatusToggleProps) {
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const { isOpen, coords, triggerRef, contentRef, close, toggle } = useDynamicPositioning<HTMLButtonElement>({
    contentWidth: 160,
    offset: 8
  });

  const handleStatusSelect = (newStatus: TaskStatus) => {
    if (newStatus === currentStatus) {
      close();
      return;
    }

    setCurrentStatus(newStatus);
    close();
    onStatusChange?.(taskId, newStatus);

    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, newStatus);
      if (!result.success) {
        setCurrentStatus(initialStatus);
        onStatusChange?.(taskId, initialStatus);
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const config = STATUS_CONFIG[currentStatus];
  const Icon = config.icon;
  const isCompact = size === "sm";

  if (variant === "badge") {
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
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const SIcon = cfg.icon;
                const active = s === currentStatus;

                return (
                  <button
                    key={s}
                    onClick={() => handleStatusSelect(s)}

                  >
                    <div

                    >
                      <SIcon size={9} strokeWidth={3} />
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

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        onClick={toggle}
        disabled={isPending}
        title={`Status: ${currentStatus}`}

      >
        <Icon size={11} strokeWidth={currentStatus === "DONE" ? 4 : 3} />
      </button>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={contentRef as React.RefObject<HTMLDivElement>}

        >
          <div >
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const SIcon = cfg.icon;
              const active = s === currentStatus;

              return (
                <button
                  key={s}
                  onClick={() => handleStatusSelect(s)}

                >
                  <div

                  >
                    <SIcon size={9} strokeWidth={3} />
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
