"use server";

import * as weeklyReviewService from "../services/weekly-review-service";
import { invalidateTaskCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import type { SaveWeeklyReviewInput, WeeklyReviewSettings } from "../types";

export async function saveWeeklyReviewAction(
  input: SaveWeeklyReviewInput,
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await weeklyReviewService.saveWeeklyReview(userId, input);
    invalidateTaskCache(userId);
  });
}

export async function saveWeeklyReviewSettingsAction(
  input: WeeklyReviewSettings,
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await weeklyReviewService.saveSettings(userId, input);
    invalidateTaskCache(userId);
  });
}
