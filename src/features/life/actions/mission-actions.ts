"use server";

import * as missionService from "../services/mission-service";
import { invalidateMissionCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";

export async function saveMissionAction(
  content: string,
): Promise<ActionResult<Awaited<ReturnType<typeof missionService.saveMission>>>> {
  return withAction(async (userId) => {
    const version = await missionService.saveMission(userId, content);
    invalidateMissionCache(userId);
    return version;
  });
}
