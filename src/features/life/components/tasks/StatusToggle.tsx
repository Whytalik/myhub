"use client";

import { useState, useTransition } from "react";
import { Check, Play, Circle, XCircle, LucideIcon } from "lucide-react";
import { updateTaskStatusAction } from "@/features/life/actions/task-actions";
import type { TaskStatus } from "@/features/life/types";

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  TODO:        "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE:        "TODO",
  CANCELLED:   "TODO",
};

export const STATUS_CONFIG: Record<TaskStatus, { style: string, icon: LucideIcon, label: string, color: string }> = {
  TODO: { 
    style: "border-border hover:border-accent/50 text-muted", 
    icon: Circle,
    label: "Todo",
    color: "var(--color-muted)"
  },
  IN_PROGRESS: { 
    style: "bg-blue-500/10 border-blue-500/50 text-blue-400", 
    icon: Play,
    label: "In Progress",
    color: "#60a5fa"
  },
  DONE: { 
    style: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400", 
    icon: Check,
    label: "Done",
    color: "#34d399"
  },
  CANCELLED: { 
    style: "bg-raised border-border text-muted/60", 
    icon: XCircle,
    label: "Cancelled",
    color: "var(--color-muted-dim)"
  },
};

interface StatusToggleProps {
  taskId: string;
  status: TaskStatus;
}

export function StatusToggle({ taskId, status: initialStatus }: StatusToggleProps) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const next = NEXT_STATUS[status];
    setStatus(next);
    startTransition(async () => {
      await updateTaskStatusAction(taskId, next);
    });
  };

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={`Status: ${status}`}
      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95 ${config.style}`}
    >
      <Icon size={11} strokeWidth={status === "DONE" ? 4 : 3} />
    </button>
  );
}

