import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cache/cache";

const INVALIDATE_PROFILE = { expire: 0 };

export function invalidateTaskCache(userId: string) {
  revalidateTag(cacheTags.tasks(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.spheres(userId), INVALIDATE_PROFILE);
  revalidateTag("tasks", INVALIDATE_PROFILE);
  revalidateTag("tasks-calendar", INVALIDATE_PROFILE);
  revalidateTag("tasks-by-date", INVALIDATE_PROFILE);
  revalidateTag("spheres", INVALIDATE_PROFILE);
}

export function invalidateJournalCache(userId: string, date?: Date) {
  revalidateTag(cacheTags.dailyEntries(userId), INVALIDATE_PROFILE);
  revalidateTag("daily-entry", INVALIDATE_PROFILE);
  revalidateTag("daily-entries", INVALIDATE_PROFILE);
  if (date) {
    revalidateTag(
      cacheTags.dailyEntry(userId, date.toISOString().split("T")[0]),
      INVALIDATE_PROFILE,
    );
  }
}

export function invalidateHabitCache(userId: string) {
  revalidateTag(cacheTags.habits(userId), INVALIDATE_PROFILE);
  revalidateTag("habits", INVALIDATE_PROFILE);
  revalidateTag("habits-review", INVALIDATE_PROFILE);
}

export function invalidateHabitChainCache(userId: string) {
  revalidateTag(cacheTags.habitChains(userId), INVALIDATE_PROFILE);
  revalidateTag("habit-chains", INVALIDATE_PROFILE);
  revalidateTag("habits", INVALIDATE_PROFILE);
  revalidateTag("habits-review", INVALIDATE_PROFILE);
}

export function invalidateScheduleCache(userId: string) {
  revalidateTag("week-templates", INVALIDATE_PROFILE);
}

export function invalidateExerciseCache(userId: string) {
  revalidateTag(cacheTags.exercises(userId), INVALIDATE_PROFILE);
  revalidateTag("exercises", INVALIDATE_PROFILE);
}

export function invalidateTrainingPlanCache(userId: string) {
  revalidateTag(cacheTags.trainingPlans(userId), INVALIDATE_PROFILE);
  revalidateTag("training-plans", INVALIDATE_PROFILE);
}

export function invalidateTrainingSessionCache(userId: string) {
  revalidateTag(cacheTags.trainingSessions(userId), INVALIDATE_PROFILE);
  revalidateTag("training-sessions", INVALIDATE_PROFILE);
}
