"use client";

import { useState, useTransition } from "react";
import { 
  ChevronDown 
} from "lucide-react";
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
  
  const { isOpen, coords, triggerRef, toggle, close } = useDynamicPositioning<HTMLButtonElement>({
    contentHeight: 180,
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
      try {
        await updateTaskPriorityAction(taskId, newPriority);
      } catch (error) {
        setCurrentPriority(initialPriority);
        console.error("Failed to update priority:", error);
      }
    });
  };

  const config = PRIORITY_CONFIG[currentPriority];
  const Icon = config.icon;
  const isCompact = size === "sm";

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
            {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => {
              const cfg = PRIORITY_CONFIG[p];
              const PIcon = cfg.icon;
              const active = p === currentPriority;
              
              return (
                <button
                  key={p}
                  onClick={() => handlePrioritySelect(p)}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    active ? "bg-accent/10 text-accent" : "text-secondary hover:bg-raised hover:text-text"
                  }`}
                >
                  <div 
                    className="p-1 rounded-md" 
                    style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
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
