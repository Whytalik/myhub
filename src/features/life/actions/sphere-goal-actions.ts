"use server";

import * as sphereGoalService from "../services/sphere-goal-service";
import { invalidateSphereGoalCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import type { SphereGoalData, UpsertSphereGoalInput } from "../types";

export async function upsertSphereGoalAction(
  input: UpsertSphereGoalInput,
): Promise<ActionResult<SphereGoalData>> {
  return withAction(async (userId) => {
    const goal = await sphereGoalService.upsertGoal(userId, input);
    invalidateSphereGoalCache(userId);
    return goal;
  });
}

export async function setSphereGoalValueAction(
  id: string,
  value: number,
): Promise<ActionResult<SphereGoalData>> {
  return withAction(async (userId) => {
    const goal = await sphereGoalService.setGoalValue(userId, id, value);
    invalidateSphereGoalCache(userId);
    return goal;
  });
}

export async function deleteSphereGoalAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await sphereGoalService.deleteGoal(userId, id);
    invalidateSphereGoalCache(userId);
  });
}
