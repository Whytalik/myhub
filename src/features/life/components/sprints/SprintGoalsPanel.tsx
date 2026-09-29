import { Target } from "lucide-react";
import { SPHERE_ICONS } from "@/features/life/components/tasks/lucide-icons-map";
import { formatGoalNumber } from "@/features/life/logic/sphere-goals";
import type { LifeSphereData, SprintGoalProgress } from "@/features/life/types";

interface SprintGoalsPanelProps {
  goals: SprintGoalProgress[];
  spheres: LifeSphereData[];
}

function formatSprintProgress(goal: SprintGoalProgress): string {
  const unit = goal.unit ? ` ${goal.unit}` : "";
  const sign = goal.sprintValue > 0 && goal.type === "VALUE" ? "+" : "";
  return `${sign}${formatGoalNumber(goal.sprintValue)} / ${formatGoalNumber(goal.sprintTarget)}${unit}`;
}

export function SprintGoalsPanel({ goals, spheres }: SprintGoalsPanelProps) {
  if (goals.length === 0) return null;

  const spheresWithGoals = spheres.filter((sphere) =>
    goals.some((goal) => goal.sphereId === sphere.id),
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-panel-title">Sphere goals this sprint</h3>
        <p className="text-caption mt-1">Your share of each yearly goal for this 12-week sprint.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {spheresWithGoals.map((sphere) => {
          const SphereIcon = SPHERE_ICONS[sphere.icon] || Target;
          return (
            <div
              key={sphere.id}
              className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.01] flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-2">
                <SphereIcon size={14} style={{ color: sphere.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  {sphere.name}
                </span>
              </div>
              {goals
                .filter((goal) => goal.sphereId === sphere.id)
                .map((goal) => (
                  <div key={goal.goalId} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-xs text-zinc-200 break-words">{goal.title}</span>
                      <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                        {formatSprintProgress(goal)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-life transition-all duration-300"
                        style={{ width: `${goal.sprintPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Year: {formatGoalNumber(goal.yearlyCurrent)} /{" "}
                      {formatGoalNumber(goal.yearlyTarget)} ({Math.round(goal.yearlyPercent)}%)
                    </span>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
