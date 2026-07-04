"use client";

import { useState, useTransition } from "react";
import {
  toggleHabitCompletionAction,
  toggleHabitArchivedAction,
} from "@/features/life/actions/habit-actions";
import { calculateStreak, getThisWeekCount } from "@/features/life/logic/habit-utils";
import type { HabitData } from "@/features/life/types";
import { toast } from "sonner";
import {
  Circle,
  Edit2,
  Trash2,
  Anchor,
  Zap,
  PartyPopper,
  Flame,
  Archive,
  Bell,
  ShieldCheck,
  Shield,
  TrendingUp,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Workflow,
  Wind,
  Fingerprint,
  Gauge,
  LifeBuoy,
} from "lucide-react";
import type { SphereLevel } from "@/features/life/types";

const BEHAVIOR_DETAILS: {
  key: "ifThenPlan" | "frictionReduction" | "identityStatement" | "minimalThreshold" | "copingPlan";
  label: string;
  icon: typeof Workflow;
}[] = [
  { key: "ifThenPlan", label: "If-then plan", icon: Workflow },
  { key: "frictionReduction", label: "Friction reduction", icon: Wind },
  { key: "identityStatement", label: "Identity", icon: Fingerprint },
  { key: "minimalThreshold", label: "Minimal threshold", icon: Gauge },
  { key: "copingPlan", label: "Coping plan", icon: LifeBuoy },
];

const SPHERE_LEVEL_CONFIG: Record<SphereLevel, { label: string; classes: string }> = {
  MINIMUM: { label: "Min", classes: "bg-rose-500/10 border-rose-500/20 text-rose-600" },
  MEDIUM: { label: "Medium", classes: "bg-amber-500/10 border-amber-500/20 text-amber-600" },
  DESIRED: {
    label: "Desired",
    classes: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  },
};

interface HabitCardProps {
  habit: HabitData;
  onEdit?: (habit: HabitData) => void;
  onDelete?: (id: string) => void;
  date?: Date;
}

export function HabitCard({ habit, onEdit, onDelete, date }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDetails, setShowDetails] = useState(false);

  const behaviorDetails = BEHAVIOR_DETAILS.filter(({ key }) => habit[key]);

  const activeDate = date ? new Date(date) : new Date();
  activeDate.setHours(0, 0, 0, 0);

  const isAvoidance = habit.type === "avoidance";
  const isWeekly = habit.targetDaysPerWeek < 7;

  const isCompletedOnDate = habit.completions.some(
    (c) => new Date(c.date).getTime() === activeDate.getTime(),
  );

  const streak = calculateStreak(habit.completions, habit.targetDaysPerWeek);
  const thisWeekCount = isWeekly ? getThisWeekCount(habit.completions) : 0;
  const isWeeklyTargetMet = isWeekly && thisWeekCount >= habit.targetDaysPerWeek;

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleHabitCompletionAction(habit.id, activeDate);
      if (result.success) {
        if (!isCompletedOnDate) {
          toast.success(
            isAvoidance ? "Still clean. Keep going." : "Great job! Keep the streak alive.",
          );
        }
      } else {
        toast.error(result.error || "Failed to update habit");
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = await toggleHabitArchivedAction(habit.id);
      if (!result.success) toast.error(result.error || "Failed to archive habit");
    });
  };

  const completedBorder = isAvoidance
    ? "border-amber-500/30 bg-amber-500/5"
    : "border-emerald-500/30 bg-emerald-500/5";
  const completedText = isAvoidance ? "text-amber-500" : "text-emerald-500";
  const activeDot = isAvoidance ? "bg-amber-500" : "bg-emerald-500 animate-pulse";
  const activeLabel = isAvoidance ? "text-amber-600" : "text-emerald-600";
  const completedButton = isAvoidance
    ? "bg-amber-500 text-white shadow-sm"
    : "bg-emerald-500 text-white shadow-sm";

  const cardCompleted = isWeekly ? isWeeklyTargetMet : isCompletedOnDate;

  return (
    <div
      className={`group bg-surface border rounded-xl p-6 transition-all duration-300 shadow-sm hover:shadow-md ${cardCompleted ? completedBorder : "border-border hover:border-accent/40"}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <h3
            className={`text-base font-bold transition-all ${cardCompleted ? `${completedText} line-through opacity-70` : "text-text"}`}
          >
            {habit.name}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${habit.archived ? "bg-muted" : activeDot}`} />
              <span
                className={`text-caption font-mono tracking-widest font-bold ${habit.archived ? "text-muted" : activeLabel}`}
              >
                {habit.archived ? "Archived" : isAvoidance ? "Avoidance" : "Active habit"}
              </span>
            </div>

            {/* Weekly frequency badge */}
            {isWeekly && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                  isWeeklyTargetMet
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-600"
                }`}
              >
                <CalendarDays size={10} />
                <span className="text-caption font-bold font-mono">
                  {thisWeekCount}/{habit.targetDaysPerWeek} цього тижня
                </span>
              </div>
            )}

            {streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Flame size={10} className="text-amber-500 fill-amber-500" />
                <span className="text-caption font-bold text-amber-600 font-mono">
                  {streak} {isWeekly ? "тиж." : "day"} streak
                </span>
              </div>
            )}
            {habit.reminderTime && (
              <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                <Bell size={10} className="text-blue-500" />
                <span className="text-caption font-bold text-blue-600 font-mono">
                  {habit.reminderTime}
                </span>
              </div>
            )}
            {habit.sphereLevel && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${SPHERE_LEVEL_CONFIG[habit.sphereLevel].classes}`}
              >
                <TrendingUp size={10} />
                <span className="text-caption font-bold font-mono">
                  {SPHERE_LEVEL_CONFIG[habit.sphereLevel].label}
                </span>
              </div>
            )}
            {habit.subcategory && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-raised">
                <span className="text-caption font-bold font-mono text-muted">
                  {habit.subcategory}
                </span>
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
        {habit.anchor && (
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Anchor size={14} className="text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-label font-mono tracking-widest text-muted">
                {isAvoidance ? "Trigger" : "Anchor"}
              </span>
              <p className="text-base text-secondary italic">&quot;{habit.anchor}&quot;</p>
            </div>
          </div>
        )}

        {habit.action && (
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Zap size={14} className="text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-label font-mono tracking-widest text-muted">
                {isAvoidance ? "Replacement" : "Action"}
              </span>
              <p className="text-base font-medium text-text">&quot;{habit.action}&quot;</p>
            </div>
          </div>
        )}

        {!habit.anchor && !habit.action && isAvoidance && (
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Shield size={14} className="text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-label font-mono tracking-widest text-muted">Strategy</span>
              <p className="text-base text-secondary italic">Avoid and log daily resistance</p>
            </div>
          </div>
        )}

        {habit.celebration && (
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <PartyPopper size={14} className="text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-label font-mono tracking-widest text-muted">Celebration</span>
              <p className="text-base text-secondary italic">&quot;{habit.celebration}&quot;</p>
            </div>
          </div>
        )}
      </div>

      {behaviorDetails.length > 0 && (
        <div className="mb-4 -mt-4">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="flex items-center gap-1 text-label font-mono uppercase tracking-widest text-muted hover:text-text transition-colors"
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showDetails ? "Hide" : "Show"} behavior design ({behaviorDetails.length})
          </button>
          {showDetails && (
            <div className="mt-3 space-y-3">
              {behaviorDetails.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Icon size={14} className="text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-label font-mono tracking-widest text-muted">{label}</span>
                    <p className="text-note text-secondary italic">&quot;{habit[key]}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`w-full py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all font-mono text-note font-bold tracking-[0.1em] ${
          isCompletedOnDate
            ? completedButton
            : "bg-surface border border-border text-muted hover:border-accent hover:text-accent hover:bg-accent/5"
        }`}
      >
        {isCompletedOnDate ? (
          <>
            <ShieldCheck size={18} strokeWidth={2.5} />
            {isAvoidance ? "Resisted" : isWeekly ? `Відмічено сьогодні` : "Completed"}
          </>
        ) : (
          <>
            <Circle size={18} strokeWidth={2} />
            {isAvoidance ? "Resisted today" : isWeekly ? "Відмітити сьогодні" : "Mark complete"}
          </>
        )}
      </button>
    </div>
  );
}
