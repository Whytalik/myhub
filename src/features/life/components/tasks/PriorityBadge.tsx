import type { TaskPriority } from "@/features/life/types";
import {
  ChevronDown,
  Minus,
  ChevronUp,
  AlertCircle,
  LucideIcon
} from "lucide-react";

export const PRIORITY_CONFIG: Record<TaskPriority, { style: string, icon: LucideIcon, label: string, color: string }> = {
  LOW: {
    style: "",
    icon: ChevronDown,
    label: "Low",
    color: "#60a5fa"
  },
  MEDIUM: {
    style: "",
    icon: Minus,
    label: "Med",
    color: "var(--color-muted)"
  },
  HIGH: {
    style: "",
    icon: ChevronUp,
    label: "High",
    color: "#fbbf24"
  },
  URGENT: {
    style: "",
    icon: AlertCircle,
    label: "Urgent",
    color: "#f43f5e"
  },
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  return (
    <span

    >
      <Icon size={10} strokeWidth={3} />
      {config.label}
    </span>
  );
}
