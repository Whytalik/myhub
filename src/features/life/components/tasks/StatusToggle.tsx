"use client";

import { useState, useTransition } from "react";
import { Check, Play, Circle, XCircle, PauseCircle, HelpCircle, LucideIcon } from "lucide-react";
import { updateTaskStatusAction } from "@/features/life/actions/task-actions";
import type { TaskStatus } from "@/features/life/types";

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  BACKLOG:     "TODO",
  TODO:        "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  BLOCKED:     "IN_PROGRESS",
  DONE:        "BACKLOG",
  CANCELLED:   "TODO",
};

export const STATUS_CONFIG: Record<TaskStatus, { style: string, icon: LucideIcon, label: string, color: string }> = {
  BACKLOG: { 
    style: "border-border/60 text-muted/40", 
    icon: HelpCircle,
    label: "Backlog",
    color: "#737373"
  },
  TODO: { 
    style: "border-border hover:border-accent/50 text-muted", 
    icon: Circle,
    label: "Todo",
    color: "#a3a3a3"
  },
  IN_PROGRESS: { 
    style: "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]", 
    icon: Play,
    label: "In Progress",
    color: "#60a5fa"
  },
  BLOCKED: { 
    style: "bg-amber-500/10 border-amber-500/50 text-amber-400", 
    icon: PauseCircle,
    label: "Blocked",
    color: "#fbbf24"
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
    color: "#404040"
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

