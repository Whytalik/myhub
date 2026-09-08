import { withAction, ActionResult } from "@/lib/actions/action-utils";
import { invalidateDirectionsCache } from "@/lib/cache/revalidate";
import * as directionService from "@/features/life/services/direction-service";
import type { DirectionData, UpsertDirectionInput } from "@/features/life/types";

export async function upsertDirectionAction(
  input: UpsertDirectionInput,
): Promise<ActionResult<DirectionData>> {
  return withAction(async (userId) => {
    const direction = await directionService.upsertDirection(userId, input);
    invalidateDirectionsCache(userId);
    return direction;
  });
}

export async function deleteDirectionAction(sphereId: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await directionService.deleteDirection(userId, sphereId);
    invalidateDirectionsCache(userId);
  });
}
