"use client";

import { useState, useTransition } from "react";
import { 
  Check, Play, Circle, XCircle, HelpCircle, 
  LucideIcon, ChevronDown 
} from "lucide-react";
import { updateTaskStatusAction } from "@/features/life/actions/task-actions";
import type { TaskStatus } from "@/features/life/types";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
import { createPortal } from "react-dom";

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  BACKLOG:     "TODO",
  TODO:        "IN_PROGRESS",
  IN_PROGRESS: "DONE",
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
  variant?: "icon" | "badge";
  size?: "sm" | "default";
}

export function StatusToggle({ taskId, status: initialStatus, variant = "icon", size = "default" }: StatusToggleProps) {
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();
  
  const { isOpen, coords, triggerRef, close, toggle } = useDynamicPositioning<HTMLButtonElement>({
    contentHeight: 220,
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
    
    startTransition(async () => {
      try {
        await updateTaskStatusAction(taskId, newStatus);
      } catch (error) {
        setCurrentStatus(initialStatus);
        console.error("Failed to update status:", error);
      }
    });
  };

  const config = STATUS_CONFIG[currentStatus];
  const Icon = config.icon;
  const isCompact = size === "sm";

  if (variant === "badge") {
    return (
      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
        <button
          ref={triggerRef}
          onClick={toggle}
          disabled={isPending}
          className={`flex items-center gap-1 px-1 py-0.5 rounded border font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all hover:brightness-125 active:scale-95 ${
            isCompact ? 'text-[7px] md:text-[8px]' : 'px-2 rounded-xl text-[9px]'
          }`}
          style={{ 
            backgroundColor: `${config.color}15`, 
            borderColor: `${config.color}40`, 
            color: config.color 
          }}
        >
          <Icon size={isCompact ? 6 : 10} strokeWidth={3} />
          {config.label}
          {!isCompact && <ChevronDown size={8} className="ml-0.5 opacity-40" />}
        </button>

        {isOpen && coords && typeof document !== "undefined" && createPortal(
          <div 
            className={`fixed z-[9999] w-40 p-1.5 bg-surface border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
              coords.align === 'top' ? 'origin-bottom' : 'origin-top'
            }`}
            style={{ 
              top: coords.align === 'top' ? 'auto' : coords.top,
              bottom: coords.align === 'top' ? (window.innerHeight - coords.top) : 'auto',
              left: coords.left
            }}
          >
            <div className="flex flex-col gap-0.5">
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const SIcon = cfg.icon;
                const active = s === currentStatus;
                
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusSelect(s)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      active ? "bg-accent/10 text-accent" : "text-secondary hover:bg-raised hover:text-text"
                    }`}
                  >
                    <div 
                      className="p-1 rounded-md" 
                      style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                    >
                      <SIcon size={10} strokeWidth={3} />
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

  // Original Icon-only variant
  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        onClick={toggle}
        disabled={isPending}
        title={`Status: ${currentStatus}`}
        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95 ${config.style}`}
      >
        <Icon size={11} strokeWidth={currentStatus === "DONE" ? 4 : 3} />
      </button>

      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div 
          className={`fixed z-[9999] w-40 p-1.5 bg-surface border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            coords.align === 'top' ? 'origin-bottom' : 'origin-top'
          }`}
          style={{ 
            top: coords.align === 'top' ? 'auto' : coords.top,
            bottom: coords.align === 'top' ? (window.innerHeight - coords.top) : 'auto',
            left: coords.left
          }}
        >
          <div className="flex flex-col gap-0.5">
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const SIcon = cfg.icon;
              const active = s === currentStatus;
              
              return (
                <button
                  key={s}
                  onClick={() => handleStatusSelect(s)}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    active ? "bg-accent/10 text-accent" : "text-secondary hover:bg-raised hover:text-text"
                  }`}
                >
                  <div 
                    className="p-1 rounded-md" 
                    style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                  >
                    <SIcon size={10} strokeWidth={3} />
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
