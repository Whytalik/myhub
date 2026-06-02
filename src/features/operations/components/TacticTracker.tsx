"use client";

import React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { toggleTacticCompletionAction } from "../actions/sprint-actions";
import type { TacticData } from "../types";

interface TacticTrackerProps {
  tactics: TacticData[];
  currentWeek: number;
  onRefresh: () => void;
}

export function TacticTracker({ tactics, currentWeek, onRefresh }: TacticTrackerProps) {
  const handleToggle = async (tacticId: string, completed: boolean) => {
    const result = await toggleTacticCompletionAction(tacticId, currentWeek, completed);
    if (result.success) {
      onRefresh();
    } else {
      toast.error(result.error || "Failed to toggle tactic");
    }
  };

  if (tactics.length === 0) return null;

  return (
    <div className="space-y-2 mt-4 pt-4 border-t border-border/40">
      <div className="flex justify-between items-center mb-2">
         <span className="text-label font-bold uppercase tracking-widest text-muted">Weekly Tactics (Week {currentWeek})</span>
      </div>
      <div className="space-y-1">
        {tactics.map((t) => {
          const isCompleted = t.completions.some(c => c.weekNumber === currentWeek && c.completed);
          
          const checkboxBase = "w-4 h-4 rounded border flex items-center justify-center transition-colors";
          const checkboxStyles = isCompleted ? "bg-emerald-500 border-emerald-500" : "border-border group-hover:border-accent/50";
          
          const textBase = "text-note transition-colors";
          const textStyles = isCompleted ? "text-muted line-through" : "text-secondary group-hover:text-text";

          return (
            <div 
              key={t.id} 
              onClick={() => handleToggle(t.id, !isCompleted)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-raised/50 cursor-pointer transition-colors group"
            >
              <div className={`${checkboxBase} ${checkboxStyles}`}>
                {isCompleted && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              <span className={`${textBase} ${textStyles}`}>
                {t.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
