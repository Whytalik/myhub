"use client";

import { useState, useTransition } from "react";
import {
  toggleHabitCompletionAction,
  toggleHabitArchivedAction,
} from "@/features/life/actions/habit-actions";
import {
  calculateStreak,
  getThisWeekCount,
  getScheduledCountThisWeek,
  WEEKDAY_ORDER,
  WEEKDAY_LABELS,
} from "@/features/life/logic/habit-utils";
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
  ShieldCheck,
  Shield,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Gauge,
  Link2,
} from "lucide-react";

const BEHAVIOR_DETAILS: {
  key: "identityStatement" | "minimalThreshold";
  label: string;
  icon: typeof Fingerprint;
}[] = [
  { key: "identityStatement", label: "Identity", icon: Fingerprint },
  { key: "minimalThreshold", label: "Minimal threshold", icon: Gauge },
];

interface HabitCardProps {
  habit: HabitData;
  onEdit?: (habit: HabitData) => void;
  onDelete?: (id: string) => void;
  date?: Date;
  isNextInChain?: boolean;
  nextHabitName?: string;
}

export function HabitCard({
  habit,
  onEdit,
  onDelete,
  date,
  isNextInChain,
  nextHabitName,
}: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDetails, setShowDetails] = useState(false);

  const behaviorDetails = BEHAVIOR_DETAILS.filter(({ key }) => habit[key]);

  const activeDate = date ? new Date(date) : new Date();
  activeDate.setHours(0, 0, 0, 0);

  const isAvoidance = habit.type === "avoidance";
  const isWeekly = habit.scheduledWeekdays.length < 7;
  const scheduledDaysLabel = WEEKDAY_ORDER.filter((d) => habit.scheduledWeekdays.includes(d))
    .map((d) => WEEKDAY_LABELS[d])
    .join(" ");

  const isCompletedOnDate = habit.completions.some(
    (c) => new Date(c.date).getTime() === activeDate.getTime(),
  );

  const streak = calculateStreak(habit.completions, habit.scheduledWeekdays);
  const scheduledCountThisWeek = isWeekly ? getScheduledCountThisWeek(habit.scheduledWeekdays) : 0;
  const thisWeekCount = isWeekly ? getThisWeekCount(habit.completions) : 0;
  const isWeeklyTargetMet = isWeekly && thisWeekCount >= scheduledCountThisWeek;

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleHabitCompletionAction(habit.id, activeDate);
      if (result.success) {
        if (!isCompletedOnDate) {
          toast.success(
            isAvoidance
              ? "Still clean. Keep going."
              : nextHabitName
                ? `Great job! Next: ${nextHabitName}`
                : "Great job! Keep the streak alive.",
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
  const completedText = isAvoidance ? "text-amber-400" : "text-emerald-400";
  const activeDot = isAvoidance ? "bg-amber-500" : "bg-emerald-500 animate-pulse";
  const activeLabel = isAvoidance ? "text-amber-400" : "text-emerald-400";
  const completedButton = isAvoidance
    ? "bg-amber-500 text-white shadow-sm"
    : "bg-emerald-500 text-white shadow-sm";

  const cardCompleted = isWeekly ? isWeeklyTargetMet : isCompletedOnDate;
  const showNextBadge = isNextInChain && !cardCompleted;

  const cardClass = `glass-card p-4 flex flex-col gap-4 border transition-colors duration-150 ${
    cardCompleted
      ? completedBorder
      : showNextBadge
        ? "border-accent/40 ring-1 ring-accent/30"
        : "border-white/[0.06]"
  }`;
  const titleClass = `text-panel-title ${cardCompleted ? completedText : ""}`;
  const activeDotClass = `w-1.5 h-1.5 rounded-full ${activeDot}`;
  const activeLabelClass = `text-[10px] font-mono uppercase tracking-wide ${activeLabel}`;
  const metaChipClass =
    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-400 text-[10px] font-mono uppercase tracking-wide";
  const iconActionClass =
    "p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors";
  const deleteActionClass =
    "p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors";
  const toggleButtonClass = `flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
    isCompletedOnDate ? completedButton : "bg-white/5 text-zinc-300 hover:bg-white/10"
  }`;
  const noteIconWrapClass =
    "flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-zinc-400 shrink-0";
  const noteCardClass = "flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02]";

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-0">
          <h3 className={titleClass}>{habit.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className={activeDotClass} />
              <span className={activeLabelClass}>
                {habit.archived ? "Archived" : isAvoidance ? "Avoidance" : "Active habit"}
              </span>
            </div>

            {showNextBadge && (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/15 text-accent text-[10px] font-mono uppercase tracking-wide">
                <Link2 size={10} />
                <span>Next up</span>
              </div>
            )}

            {isWeekly && (
              <div className={metaChipClass}>
                <CalendarDays size={10} />
                <span>
                  {thisWeekCount}/{scheduledCountThisWeek} цього тижня ({scheduledDaysLabel})
                </span>
              </div>
            )}

            {streak > 0 && (
              <div className={metaChipClass}>
                <Flame size={10} />
                <span>{streak} day streak</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleArchive}
            title={habit.archived ? "Restore" : "Archive"}
            className={iconActionClass}
          >
            <Archive size={14} />
          </button>
          {onEdit && (
            <button onClick={() => onEdit(habit)} className={iconActionClass}>
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(habit.id)} className={deleteActionClass}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {habit.anchor && (
          <div className={noteCardClass}>
            <div className={noteIconWrapClass}>
              <Anchor size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-label">{isAvoidance ? "Trigger" : "Anchor"}</span>
              <p className="text-caption italic truncate">&quot;{habit.anchor}&quot;</p>
            </div>
          </div>
        )}

        {habit.action && (
          <div className={noteCardClass}>
            <div className={noteIconWrapClass}>
              <Zap size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-label">{isAvoidance ? "Replacement" : "Action"}</span>
              <p className="text-caption italic truncate">&quot;{habit.action}&quot;</p>
            </div>
          </div>
        )}

        {!habit.anchor && !habit.action && isAvoidance && (
          <div className={noteCardClass}>
            <div className={noteIconWrapClass}>
              <Shield size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-label">Strategy</span>
              <p className="text-caption italic">Avoid and log daily resistance</p>
            </div>
          </div>
        )}

        {habit.celebration && (
          <div className={noteCardClass}>
            <div className={noteIconWrapClass}>
              <PartyPopper size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-label">Celebration</span>
              <p className="text-caption italic truncate">&quot;{habit.celebration}&quot;</p>
            </div>
          </div>
        )}
      </div>

      {behaviorDetails.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors w-fit"
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showDetails ? "Hide" : "Show"} behavior design ({behaviorDetails.length})
          </button>
          {showDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {behaviorDetails.map(({ key, label, icon: Icon }) => (
                <div key={key} className={noteCardClass}>
                  <div className={noteIconWrapClass}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-label">{label}</span>
                    <p className="text-caption italic truncate">&quot;{habit[key]}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button onClick={handleToggle} disabled={isPending} className={toggleButtonClass}>
        {isCompletedOnDate ? (
          <>
            <ShieldCheck size={18} strokeWidth={2.5} />
            {isAvoidance ? "Resisted" : isWeekly ? "Відмічено сьогодні" : "Completed"}
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
