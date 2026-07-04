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

    >
      <div >
        <div >
          <h3

          >
            {habit.name}
          </h3>
          <div >
            <div >
              <div />
              <span

              >
                {habit.archived ? "Archived" : isAvoidance ? "Avoidance" : "Active habit"}
              </span>
            </div>

            {}
            {isWeekly && (
              <div

              >
                <CalendarDays size={10} />
                <span >
                  {thisWeekCount}/{habit.targetDaysPerWeek} цього тижня
                </span>
              </div>
            )}

            {streak > 0 && (
              <div >
                <Flame size={10} />
                <span >
                  {streak} {isWeekly ? "тиж." : "day"} streak
                </span>
              </div>
            )}
            {habit.reminderTime && (
              <div >
                <Bell size={10} />
                <span >
                  {habit.reminderTime}
                </span>
              </div>
            )}
            {habit.sphereLevel && (
              <div

              >
                <TrendingUp size={10} />
                <span >
                  {SPHERE_LEVEL_CONFIG[habit.sphereLevel].label}
                </span>
              </div>
            )}
            {habit.subcategory && (
              <div >
                <span >
                  {habit.subcategory}
                </span>
              </div>
            )}
          </div>
        </div>

        <div >
          <button
            onClick={handleArchive}
            title={habit.archived ? "Restore" : "Archive"}

          >
            <Archive size={14} />
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(habit)}

            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(habit.id)}

            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div >
        {habit.anchor && (
          <div >
            <div >
              <Anchor size={14} />
            </div>
            <div >
              <span >
                {isAvoidance ? "Trigger" : "Anchor"}
              </span>
              <p >&quot;{habit.anchor}&quot;</p>
            </div>
          </div>
        )}

        {habit.action && (
          <div >
            <div >
              <Zap size={14} />
            </div>
            <div >
              <span >
                {isAvoidance ? "Replacement" : "Action"}
              </span>
              <p >&quot;{habit.action}&quot;</p>
            </div>
          </div>
        )}

        {!habit.anchor && !habit.action && isAvoidance && (
          <div >
            <div >
              <Shield size={14} />
            </div>
            <div >
              <span >Strategy</span>
              <p >Avoid and log daily resistance</p>
            </div>
          </div>
        )}

        {habit.celebration && (
          <div >
            <div >
              <PartyPopper size={14} />
            </div>
            <div >
              <span >Celebration</span>
              <p >&quot;{habit.celebration}&quot;</p>
            </div>
          </div>
        )}
      </div>

      {behaviorDetails.length > 0 && (
        <div >
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}

          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showDetails ? "Hide" : "Show"} behavior design ({behaviorDetails.length})
          </button>
          {showDetails && (
            <div >
              {behaviorDetails.map(({ key, label, icon: Icon }) => (
                <div key={key} >
                  <div >
                    <Icon size={14} />
                  </div>
                  <div >
                    <span >{label}</span>
                    <p >&quot;{habit[key]}&quot;</p>
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
