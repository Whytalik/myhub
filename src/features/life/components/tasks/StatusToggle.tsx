"use client";

import { useState, useTransition } from "react";
import { Check, Play, Circle, XCircle, HelpCircle, LucideIcon, ChevronDown } from "lucide-react";
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

export const STATUS_CONFIG: Record<
  TaskStatus,
  { style: string; icon: LucideIcon; label: string; color: string }
> = {
  BACKLOG: {
    style: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    icon: HelpCircle,
    label: "Backlog",
    color: "#737373",
  },
  TODO: {
    style: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    icon: Circle,
    label: "Todo",
    color: "#a3a3a3",
  },
  IN_PROGRESS: {
    style: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    icon: Play,
    label: "In Progress",
    color: "#60a5fa",
  },
  DONE: {
    style: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    icon: Check,
    label: "Done",
    color: "#34d399",
  },
  CANCELLED: {
    style: "text-zinc-600 bg-zinc-600/10 border-zinc-600/20",
    icon: XCircle,
    label: "Cancelled",
    color: "#404040",
  },
};

interface StatusToggleProps {
  taskId: string;
  status: TaskStatus;
  variant?: "icon" | "badge";
  size?: "sm" | "default";
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

export function StatusToggle({
  taskId,
  status: initialStatus,
  variant = "icon",
  size = "default",
  onStatusChange,
}: StatusToggleProps) {
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const { isOpen, coords, triggerRef, contentRef, close, toggle } =
    useDynamicPositioning<HTMLButtonElement>({
      contentWidth: 160,
      offset: 8,
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
  const isDone = currentStatus === "DONE";
  const badgeTriggerClass = `inline-flex items-center gap-1 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide transition-opacity duration-150 ${
    isCompact ? "px-1 py-0.5" : "px-1.5 py-0.5"
  } ${config.style} ${isPending ? "opacity-50" : ""}`;
  const iconTriggerClass = `flex items-center justify-center rounded-full border transition-opacity duration-150 ${
    isCompact ? "w-5 h-5" : "w-6 h-6"
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

  const statusMenu =
    isOpen &&
    coords &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={contentRef as React.RefObject<HTMLDivElement>}
        style={dropdownStyle}
        onClick={(e) => e.stopPropagation()}
        className="glass-elevated p-1.5 flex flex-col gap-0.5 z-[9000]"
      >
        {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const SIcon = cfg.icon;
          const active = s === currentStatus;
          const optionClass = `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-left transition-colors duration-150 ${
            active
              ? "bg-accent/15 text-accent font-medium"
              : "text-zinc-300 hover:bg-white/5 hover:text-white"
          }`;
          const iconWrapClass = `flex items-center justify-center w-5 h-5 rounded ${cfg.style}`;

          return (
            <button key={s} onClick={() => handleStatusSelect(s)} className={optionClass}>
              <div className={iconWrapClass}>
                <SIcon size={9} strokeWidth={3} />
              </div>
              {cfg.label}
            </button>
          );
        })}
      </div>,
      document.body,
    );

  if (variant === "badge") {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <button
          ref={triggerRef}
          onClick={toggle}
          disabled={isPending}
          className={badgeTriggerClass}
        >
          <Icon size={isCompact ? 8 : 10} strokeWidth={3} />
          {config.label}
          {!isCompact && <ChevronDown size={8} />}
        </button>
        {statusMenu}
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
        className={iconTriggerClass}
      >
        <Icon size={11} strokeWidth={isDone ? 4 : 3} />
      </button>
      {statusMenu}
    </div>
  );
}
