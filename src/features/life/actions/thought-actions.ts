"use server";

import * as thoughtService from "../services/thought-service";
import type { DecomposeThoughtResult } from "../services/thought-service";
import { invalidateThoughtCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import type { UpsertThoughtStatusInput, UpsertThoughtInput } from "../types";
import type { FilterOutcome } from "../logic/filter-outcomes";

export async function upsertStatusAction(
  input: UpsertThoughtStatusInput,
): Promise<ActionResult<Awaited<ReturnType<typeof thoughtService.upsertStatus>>>> {
  return withAction(async (userId) => {
    const status = await thoughtService.upsertStatus(userId, input);
    invalidateThoughtCache(userId);
    return status;
  });
}

export async function deleteStatusAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await thoughtService.deleteStatus(userId, id);
    invalidateThoughtCache(userId);
  });
}

export async function reorderStatusesAction(
  orderedStatusIds: string[],
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await thoughtService.reorderStatuses(userId, orderedStatusIds);
    invalidateThoughtCache(userId);
  });
}

export async function upsertThoughtAction(
  input: UpsertThoughtInput,
): Promise<ActionResult<Awaited<ReturnType<typeof thoughtService.upsertThought>>>> {
  return withAction(async (userId) => {
    const thought = await thoughtService.upsertThought(userId, input);
    invalidateThoughtCache(userId);
    return thought;
  });
}

export async function deleteThoughtAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await thoughtService.deleteThought(userId, id);
    invalidateThoughtCache(userId);
  });
}

export async function quickCaptureAction(
  content: string,
  extra?: Parameters<typeof thoughtService.quickCapture>[2],
): Promise<ActionResult<Awaited<ReturnType<typeof thoughtService.quickCapture>>>> {
  return withAction(async (userId) => {
    const thought = await thoughtService.quickCapture(userId, content, extra);
    invalidateThoughtCache(userId);
    return thought;
  });
}

export async function moveThoughtAction(
  thoughtId: string,
  targetStatusId: string,
  orderedIdsInTargetColumn: string[],
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await thoughtService.moveThought(userId, thoughtId, targetStatusId, orderedIdsInTargetColumn);
    invalidateThoughtCache(userId);
  });
}

export async function routeThoughtAction(
  thoughtId: string,
  outcome: FilterOutcome,
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await thoughtService.routeThought(userId, thoughtId, outcome);
    invalidateThoughtCache(userId);
  });
}

export async function decomposeThoughtAction(input: {
  thoughtId: string;
  type: "task" | "project";
  taskTitle?: string;
  sphereId?: string | null;
  description?: string | null;
  priority?: string;
  projectTitle?: string;
  atomTitle?: string;
  atomDescription?: string | null;
  resistance?: number | null;
  projectId?: string | null;
  parentId?: string | null;
}): Promise<
  ActionResult<import("@/features/life/services/thought-service").DecomposeThoughtResult>
> {
  return withAction(async (userId) => {
    const result = await thoughtService.decomposeThought(userId, input);
    invalidateThoughtCache(userId);
    const { invalidateTaskCache } = await import("@/lib/cache/revalidate");
    invalidateTaskCache(userId);
    return result as DecomposeThoughtResult;
  });
}
