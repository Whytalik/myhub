import type { TaskPriority } from "@/features/life/types";
import { ChevronDown, Minus, ChevronUp, AlertCircle, LucideIcon } from "lucide-react";

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { style: string; icon: LucideIcon; label: string; color: string }
> = {
  LOW: {
    style: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    icon: ChevronDown,
    label: "Low",
    color: "#60a5fa",
  },
  MEDIUM: {
    style: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    icon: Minus,
    label: "Med",
    color: "#a1a1aa",
  },
  HIGH: {
    style: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    icon: ChevronUp,
    label: "High",
    color: "#fbbf24",
  },
  URGENT: {
    style: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    icon: AlertCircle,
    label: "Urgent",
    color: "#f43f5e",
  },
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  const badgeClass = `inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide ${config.style} ${className}`;

  return (
    <span className={badgeClass}>
      <Icon size={10} strokeWidth={3} />
      {config.label}
    </span>
  );
}
