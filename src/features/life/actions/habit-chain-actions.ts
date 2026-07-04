"use server";

import * as habitChainService from "../services/habit-chain-service";
import { invalidateHabitChainCache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
import type { UpsertHabitChainInput } from "../types";

export async function upsertHabitChainAction(
  data: UpsertHabitChainInput,
): Promise<ActionResult<Awaited<ReturnType<typeof habitChainService.upsertChain>>>> {
  return withAction(async (userId) => {
    const chain = await habitChainService.upsertChain(userId, data);
    invalidateHabitChainCache(userId);
    return chain;
  });
}

export async function deleteHabitChainAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await habitChainService.deleteChain(userId, id);
    invalidateHabitChainCache(userId);
  });
}

export async function reorderHabitsInChainAction(
  chainId: string,
  orderedHabitIds: string[],
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await habitChainService.reorderHabitsInChain(userId, chainId, orderedHabitIds);
    invalidateHabitChainCache(userId);
  });
}
