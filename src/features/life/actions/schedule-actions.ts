"use server";

import * as scheduleService from "../services/schedule-service";
import { invalidateScheduleCache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
import type { UpsertDayScheduleInput } from "../types";

export async function upsertDayScheduleAction(
  data: UpsertDayScheduleInput
): Promise<ActionResult<Awaited<ReturnType<typeof scheduleService.upsertSchedule>>>> {
  return withAction(async (userId) => {
    const result = await scheduleService.upsertSchedule(userId, data);
    invalidateScheduleCache(userId);
    return result;
  });
}

export async function getSchedulesForWeekAction(
  weekStart: string
): Promise<ActionResult<Awaited<ReturnType<typeof scheduleService.getSchedulesForWeek>>>> {
  return withAction(async (userId) => {
    return scheduleService.getSchedulesForWeek(userId, new Date(weekStart));
  });
}
