"use server";

import * as yearFocusService from "../services/year-focus-service";
import { invalidateSphereGoalCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import type { SetYearFocusInput, YearFocusData } from "../types";

export async function setYearFocusAction(
  input: SetYearFocusInput,
): Promise<ActionResult<YearFocusData>> {
  return withAction(async (userId) => {
    const focus = await yearFocusService.setFocus(userId, input);
    invalidateSphereGoalCache(userId);
    return focus;
  });
}

export async function clearYearFocusAction(year: number): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await yearFocusService.clearFocus(userId, year);
    invalidateSphereGoalCache(userId);
  });
}

export async function getVoteMomentAction(source: {
  taskId?: string;
  habitId?: string;
}): Promise<ActionResult<{ identity: string; total: number } | null>> {
  return withAction((userId) => yearFocusService.getVoteMoment(userId, source));
}
