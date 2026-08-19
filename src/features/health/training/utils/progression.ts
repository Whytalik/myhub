import type { TrackingType } from "../types";

export interface ProgressionSuggestion {
  type: "increase_reps" | "increase_weight";
  message: string;
}

interface ProgressionTarget {
  targetReps: number | null;
  targetRpe: number | null;
  targetRir: number | null;
  trackingType: TrackingType;
}

interface ProgressionSetLog {
  reps: number | null;
  rpe: number | null;
  rir: number | null;
  completed: boolean;
  isWarmup: boolean;
}

const STALE_SESSION_DAYS = 14;
const DEFAULT_TARGET_RIR = 2;
const DEFAULT_TARGET_RPE = 8;
const RIR_PROGRESSION_BUFFER = 1;
const RPE_PROGRESSION_BUFFER = 1;

/**
 * Evidence-based rule (RIR/RPE-gated autoregulation): the last completed
 * session's working sets all hit or exceeded the rep target with a rep-in-reserve
 * cushion above target, meaning there's room to add load next time.
 * Warm-up sets are excluded — their RIR/reps aren't representative of true effort.
 */
export function computeProgressionSuggestion(
  target: ProgressionTarget,
  lastSessionDate: Date,
  now: Date,
  lastSessionSets: ProgressionSetLog[],
): ProgressionSuggestion | null {
  if (target.trackingType !== "weight_reps" && target.trackingType !== "bodyweight") return null;
  if (target.targetReps == null) return null;

  const daysSinceLastSession = (now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastSession > STALE_SESSION_DAYS) return null;

  const workingSets = lastSessionSets.filter((s) => !s.isWarmup);
  if (workingSets.length === 0) return null;

  const rirThreshold = (target.targetRir ?? DEFAULT_TARGET_RIR) + RIR_PROGRESSION_BUFFER;
  const rpeThreshold = (target.targetRpe ?? DEFAULT_TARGET_RPE) - RPE_PROGRESSION_BUFFER;

  const allSetsReadyToProgress = workingSets.every((set) => {
    if (!set.completed || set.reps == null || set.reps < target.targetReps!) return false;
    if (set.rir != null) return set.rir >= rirThreshold;
    if (set.rpe != null) return set.rpe <= rpeThreshold;
    return false;
  });

  if (!allSetsReadyToProgress) return null;

  if (target.trackingType === "bodyweight") {
    return { type: "increase_reps", message: "Час додати повторення" };
  }

  return { type: "increase_weight", message: "Час збільшити вагу" };
}
