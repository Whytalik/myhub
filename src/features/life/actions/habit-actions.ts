"use server";

import * as habitService from "../services/habit-service";
import { invalidateHabitCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import type { UpsertHabitInput } from "../types";

export async function upsertHabitAction(
  data: UpsertHabitInput,
): Promise<ActionResult<Awaited<ReturnType<typeof habitService.upsertHabit>>>> {
  return withAction(async (userId) => {
    const habit = await habitService.upsertHabit(userId, data);
    invalidateHabitCache(userId);
    return habit;
  });
}

export async function deleteHabitAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await habitService.deleteHabit(userId, id);
    invalidateHabitCache(userId);
  });
}

export async function toggleHabitCompletionAction(
  habitId: string,
  date: Date | string,
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await habitService.toggleHabitCompletion(userId, habitId, date);
    invalidateHabitCache(userId);
  });
}

export async function toggleHabitArchivedAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await habitService.toggleHabitArchived(userId, id);
    invalidateHabitCache(userId);
  });
}
