"use server";

import * as sphereRoleService from "../services/sphere-role-service";
import { invalidateSphereGoalCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";

export async function setSphereRoleAction(input: {
  year: number;
  sphereId: string;
  role: sphereRoleService.StoredSphereRole;
  plank?: string | null;
}): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await sphereRoleService.setRole(userId, input);
    invalidateSphereGoalCache(userId);
  });
}
