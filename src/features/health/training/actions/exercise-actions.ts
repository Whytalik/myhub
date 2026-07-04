"use server";

import * as exerciseService from "../services/exercise-service";
import { invalidateExerciseCache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
import type { UpsertExerciseInput } from "../types";

export async function upsertExerciseAction(
  data: UpsertExerciseInput,
): Promise<ActionResult<Awaited<ReturnType<typeof exerciseService.upsertExercise>>>> {
  return withAction(async (userId) => {
    const exercise = await exerciseService.upsertExercise(userId, data);
    invalidateExerciseCache(userId);
    return exercise;
  });
}

export async function deleteExerciseAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await exerciseService.deleteExercise(userId, id);
    invalidateExerciseCache(userId);
  });
}
