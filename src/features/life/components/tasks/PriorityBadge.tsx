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
    style: "text-blue-400 bg-blue-400/10 border-blue-400/20", 
    icon: ChevronDown, 
    label: "Low",
    color: "#60a5fa"
  },
  MEDIUM: { 
    style: "text-secondary bg-raised border-border/40", 
    icon: Minus, 
    label: "Med",
    color: "var(--color-muted)"
  },
  HIGH: { 
    style: "text-amber-400 bg-amber-400/10 border-amber-400/20", 
    icon: ChevronUp, 
    label: "High",
    color: "#fbbf24"
  },
  URGENT: { 
    style: "text-rose-400 bg-rose-400/10 border-rose-400/20", 
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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${className}`}
      style={{ 
        color: config.color, 
        borderColor: `${config.color}30`, 
        backgroundColor: `${config.color}10` 
      }}
    >
      <Icon size={10} strokeWidth={3} />
      {config.label}
    </span>
  );
}
