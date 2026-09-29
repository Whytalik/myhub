import type { SphereGoalData, SphereGoalType } from "../types";

export const GOAL_TYPE_LABELS: Record<SphereGoalType, string> = {
  COUNTER: "Counter",
  DAYS: "Days of the year",
  VALUE: "Value",
};

export const GOAL_TYPE_HINTS: Record<SphereGoalType, string> = {
  COUNTER: "Accumulates toward a total. e.g. 50 gym workouts.",
  DAYS: "Days you do the action. e.g. magnesium 300 days.",
  VALUE: "A metric that moves from a start to a target. e.g. weight 92 → 85 kg.",
};

export type GoalPace = "done" | "on-track" | "behind" | "unknown";

// Pace compares real progress with the share of the year that has passed.
// A 10-point cushion avoids flagging a goal that is only slightly late.
export function getGoalPace(goal: SphereGoalData): GoalPace {
  if (goal.progressPercent >= 100) return "done";
  if (goal.expectedPercent === null) return "unknown";
  return goal.progressPercent >= goal.expectedPercent - 10 ? "on-track" : "behind";
}

export const GOAL_PACE_LABELS: Record<GoalPace, string> = {
  done: "Done",
  "on-track": "On track",
  behind: "Behind",
  unknown: "",
};

export const GOAL_PACE_TEXT_CLASS: Record<GoalPace, string> = {
  done: "text-emerald-400",
  "on-track": "text-emerald-400",
  behind: "text-amber-400",
  unknown: "text-zinc-500",
};

export function formatGoalNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatGoalProgress(goal: SphereGoalData): string {
  const unit = goal.unit ? ` ${goal.unit}` : "";
  return `${formatGoalNumber(goal.currentValue)} / ${formatGoalNumber(goal.targetValue)}${unit}`;
}
