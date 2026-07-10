"use server";

import * as scheduleService from "../services/schedule-service";
import { invalidateScheduleCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import type { UpsertDayScheduleInput } from "../types";

export async function upsertDayScheduleAction(
  data: UpsertDayScheduleInput,
): Promise<ActionResult<Awaited<ReturnType<typeof scheduleService.upsertSchedule>>>> {
  return withAction(async (userId) => {
    const result = await scheduleService.upsertSchedule(userId, data);
    invalidateScheduleCache(userId);
    return result;
  });
}

export async function getAllTemplatesAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof scheduleService.getAllTemplates>>>
> {
  return withAction(async (userId) => {
    return scheduleService.getAllTemplates(userId);
  });
}
