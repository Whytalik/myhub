import type { TrainingGoal } from "../types";

export const TRAINING_GOAL_OPTIONS: { value: TrainingGoal; label: string }[] = [
  { value: "strength", label: "Сила" },
  { value: "hypertrophy", label: "Гіпертрофія" },
  { value: "endurance", label: "Витривалість" },
];

// NSCA/ACSM position-stand rep ranges by training goal (Ratamess et al. 2009).
export const REP_RANGES: Record<TrainingGoal, { min: number; max: number }> = {
  strength: { min: 1, max: 6 },
  hypertrophy: { min: 6, max: 12 },
  endurance: { min: 15, max: 20 },
};

// Practitioner-consensus default (NSCA Essentials of Strength Training and
// Conditioning) for a single warm-up set before a compound lift's working
// sets: light enough to groove the pattern without accumulating fatigue.
export const WARMUP_WEIGHT_PERCENT = 0.5;
export const WARMUP_REPS = 6;

export function isRepsWithinRange(reps: number | null, goal: TrainingGoal): boolean | null {
  if (reps == null) return null;
  const range = REP_RANGES[goal];
  return reps >= range.min && reps <= range.max;
}
