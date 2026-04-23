"use client";

import { useTransition } from "react";
import { toggleHabitCompletionAction, toggleHabitArchivedAction } from "@/features/life/actions/habit-actions";
import { calculateStreak } from "@/features/life/logic/habit-utils";
import type { HabitData } from "@/features/life/types";
import { toast } from "sonner";
import { CheckCircle2, Circle, Edit2, Trash2, Anchor, Zap, PartyPopper, Flame, Archive } from "lucide-react";

interface HabitCardProps {
  habit: HabitData;
  onEdit?: (habit: HabitData) => void;
  onDelete?: (id: string) => void;
  date?: Date;
}

export function HabitCard({ habit, onEdit, onDelete, date }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();

  const activeDate = date || new Date();
  activeDate.setHours(0, 0, 0, 0);
  
  const isCompletedOnDate = habit.completions.some(
    (c) => new Date(c.date).getTime() === activeDate.getTime()
  );

  const streak = calculateStreak(habit.completions);

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleHabitCompletionAction(habit.id, activeDate);
        if (!isCompletedOnDate) {
          toast.success("Great job! Keep the streak alive.");
        }
      } catch {
        toast.error("Failed to update habit");
      }
    });
  };

const handleArchive = () => {
    startTransition(async () => {
      try {
        await toggleHabitArchivedAction(habit.id);
      } catch {
        toast.error("Failed to archive habit");
      }
    });
  };

  return (
    <div className={`group bg-surface border rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md ${isCompletedOnDate ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:border-accent/40"}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <h3 className={`text-lg font-bold transition-all ${isCompletedOnDate ? "text-emerald-500 line-through opacity-70" : "text-text"}`}>
            {habit.name}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${habit.archived ? "bg-muted" : "bg-emerald-500 animate-pulse"}`} />
              <span className={`text-[10px] font-mono tracking-widest font-bold ${habit.archived ? "text-muted" : "text-emerald-600"}`}>
                {habit.archived ? "Archived" : "Active habit"}
              </span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Flame size={10} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold text-amber-600 font-mono">{streak} day streak</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleArchive}
            title={habit.archived ? "Restore" : "Archive"}
            className="p-2 rounded-lg text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
          >
            <Archive size={14} />
          </button>
          {onEdit && (
            <button 
              onClick={() => onEdit(habit)}
              className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(habit.id)}
              className="p-2 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-1.5 rounded-lg bg-accent/10 border border-accent/20">
            <Anchor size={14} className="text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-widest text-muted">Anchor</span>
            <p className="text-sm text-secondary italic">&quot;{habit.anchor}&quot;</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Zap size={14} className="text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-widest text-muted">Action</span>
            <p className="text-sm font-medium text-text">&quot;{habit.action}&quot;</p>
          </div>
        </div>

        {habit.celebration && (
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <PartyPopper size={14} className="text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono tracking-widest text-muted">Celebration</span>
              <p className="text-sm text-secondary italic">&quot;{habit.celebration}&quot;</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`w-full py-3.5 rounded-xl border flex items-center justify-center gap-3 transition-all font-mono text-[11px] font-bold tracking-[0.1em] ${
          isCompletedOnDate 
            ? "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
            : "bg-surface border-border text-muted hover:border-accent hover:text-accent hover:bg-accent/5"
        }`}
      >
        {isCompletedOnDate ? (
          <>
            <CheckCircle2 size={18} strokeWidth={2.5} />
            Completed
          </>
        ) : (
          <>
            <Circle size={18} strokeWidth={2} />
            Mark complete
          </>
        )}
      </button>
    </div>
  );
}
