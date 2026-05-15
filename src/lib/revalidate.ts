import { revalidateTag } from "next/cache";
import { cacheTags } from "./cache";

const INVALIDATE_PROFILE = { expire: 0 };

export function invalidateUserCache(userId: string) {
  revalidateTag(cacheTags.user(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.profile(userId), INVALIDATE_PROFILE);
  revalidateTag("user-profile", INVALIDATE_PROFILE);
}

export function invalidateTaskCache(userId: string) {
  revalidateTag(cacheTags.tasks(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.spheres(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.alignment(userId), INVALIDATE_PROFILE);
  revalidateTag("tasks", INVALIDATE_PROFILE);
  revalidateTag("tasks-calendar", INVALIDATE_PROFILE);
  revalidateTag("tasks-by-date", INVALIDATE_PROFILE);
  revalidateTag("spheres", INVALIDATE_PROFILE);
  revalidateTag("alignment", INVALIDATE_PROFILE);
}

export function invalidateJournalCache(userId: string, date?: Date) {
  revalidateTag(cacheTags.dailyEntries(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.systemStatus(userId), INVALIDATE_PROFILE);
  revalidateTag("daily-entry", INVALIDATE_PROFILE);
  revalidateTag("daily-entries", INVALIDATE_PROFILE);
  revalidateTag("recent-entries", INVALIDATE_PROFILE);
  revalidateTag("entries-for-stats", INVALIDATE_PROFILE);
  revalidateTag("system-status", INVALIDATE_PROFILE);
  if (date) {
    revalidateTag(cacheTags.dailyEntry(userId, date.toISOString().split("T")[0]), INVALIDATE_PROFILE);
  }
}

export function invalidateHabitCache(userId: string) {
  revalidateTag(cacheTags.habits(userId), INVALIDATE_PROFILE);
  revalidateTag("habits", INVALIDATE_PROFILE);
}

export function invalidateSprintCache(userId: string) {
  revalidateTag(cacheTags.sprint(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.alignment(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.vision(userId), INVALIDATE_PROFILE);
  revalidateTag("active-sprint", INVALIDATE_PROFILE);
  revalidateTag("all-sprints", INVALIDATE_PROFILE);
  revalidateTag("vision", INVALIDATE_PROFILE);
  revalidateTag("alignment", INVALIDATE_PROFILE);
}

export function invalidateCompassCache(userId: string) {
  revalidateTag(cacheTags.alignment(userId), INVALIDATE_PROFILE);
  revalidateTag("annual-compass", INVALIDATE_PROFILE);
}

export function invalidateProfileCache(userId: string) {
  revalidateTag(cacheTags.profile(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.user(userId), INVALIDATE_PROFILE);
  revalidateTag("user-profile", INVALIDATE_PROFILE);
  revalidateTag("private-task-password", INVALIDATE_PROFILE);
}

export function invalidateRecoveryCache(userId: string, date?: Date) {
  revalidateTag(cacheTags.systemStatus(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.dailyEntries(userId), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.user(userId), INVALIDATE_PROFILE);
  revalidateTag("system-status", INVALIDATE_PROFILE);
  revalidateTag("daily-entries", INVALIDATE_PROFILE);
  revalidateTag("recent-entries", INVALIDATE_PROFILE);
  if (date) {
    revalidateTag(cacheTags.dailyEntry(userId, date.toISOString().split("T")[0]), INVALIDATE_PROFILE);
  }
}

export function invalidateFoodCache(userId: string) {
  revalidateTag(cacheTags.dishes(), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.dishesList(), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.weekPlans(), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.dayPlans(), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.shoppingLists(), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.products(), INVALIDATE_PROFILE);
  revalidateTag(cacheTags.persons(), INVALIDATE_PROFILE);
  revalidateTag(`dishes:${userId}`, INVALIDATE_PROFILE);
  revalidateTag(`products:${userId}`, INVALIDATE_PROFILE);
}

export function invalidateWishlistCache(userId: string) {
  revalidateTag(cacheTags.wishlist(userId), INVALIDATE_PROFILE);
  revalidateTag("wishlist", INVALIDATE_PROFILE);
}

export function invalidateLanguageCache(userId: string) {
  revalidateTag(cacheTags.languages(userId), INVALIDATE_PROFILE);
  revalidateTag("languages", INVALIDATE_PROFILE);
}

export function invalidateLibraryCache(userId: string) {
  revalidateTag(cacheTags.library(userId), INVALIDATE_PROFILE);
  revalidateTag("library", INVALIDATE_PROFILE);
}

export function invalidateScheduleCache(userId: string) {
  revalidateTag(cacheTags.weekTemplates(userId), INVALIDATE_PROFILE);
  revalidateTag("week-templates", INVALIDATE_PROFILE);
}
