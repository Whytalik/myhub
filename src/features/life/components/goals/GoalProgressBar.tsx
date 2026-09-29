import { GOAL_PACE_TEXT_CLASS, getGoalPace } from "@/features/life/logic/sphere-goals";
import type { SphereGoalData } from "@/features/life/types";

const PACE_BAR_CLASS = {
  done: "bg-emerald-400",
  "on-track": "bg-accent-life",
  behind: "bg-amber-400",
  unknown: "bg-zinc-500",
} as const;

export function GoalProgressBar({ goal }: { goal: SphereGoalData }) {
  const pace = getGoalPace(goal);
  const barClassName = `h-full rounded-full transition-all duration-300 ${PACE_BAR_CLASS[pace]}`;
  const percentClassName = `text-[10px] font-mono font-semibold ${GOAL_PACE_TEXT_CLASS[pace]}`;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={barClassName} style={{ width: `${goal.progressPercent}%` }} />
        {goal.expectedPercent !== null && (
          <div
            className="absolute top-0 h-full w-px bg-white/50"
            style={{ left: `${goal.expectedPercent}%` }}
            title="Where you should be by now"
          />
        )}
      </div>
      <span className={percentClassName}>{Math.round(goal.progressPercent)}%</span>
    </div>
  );
}
