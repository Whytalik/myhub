import { getCachedThoughtBoard } from "@/lib/cache/cache";
import { thoughtStatusRepository } from "../repositories/thought-status.repository";
import { thoughtRepository } from "../repositories/thought.repository";
import { DEFAULT_THOUGHT_STATUSES } from "../constants";
import type { UpsertThoughtStatusInput, UpsertThoughtInput } from "../types";

export async function getBoard(userId: string) {
  // Uncached check so a first-ever visit doesn't cache an empty board before
  // the defaults exist (revalidateTag isn't available from this render path).
  const existingCount = await thoughtStatusRepository.count(userId);
  if (existingCount === 0) {
    await thoughtStatusRepository.createMany(
      DEFAULT_THOUGHT_STATUSES.map((status) => ({ ...status, userId })),
    );
  }
  return getCachedThoughtBoard(userId);
}

export async function upsertStatus(userId: string, input: UpsertThoughtStatusInput) {
  const { id, ...data } = input;
  if (id) {
    return thoughtStatusRepository.update(id, userId, data);
  }
  if (!data.name) throw new Error("Name is required");
  const count = await thoughtStatusRepository.count(userId);
  return thoughtStatusRepository.create({
    name: data.name,
    color: data.color,
    order: data.order ?? count,
    userId,
  });
}

export async function deleteStatus(userId: string, id: string) {
  return thoughtStatusRepository.delete(id, userId);
}

export async function reorderStatuses(userId: string, orderedStatusIds: string[]) {
  const statuses = await thoughtStatusRepository.findManyByIds(orderedStatusIds, userId);
  if (statuses.length !== orderedStatusIds.length) {
    throw new Error("Status not found or unauthorized");
  }
  return thoughtStatusRepository.reorder(userId, orderedStatusIds);
}

export async function upsertThought(userId: string, input: UpsertThoughtInput) {
  const { id, ...data } = input;
  if (id) {
    return thoughtRepository.update(id, userId, data);
  }

  if (!data.statusId) throw new Error("statusId is required to create a thought");
  if (!data.content) throw new Error("Content is required");

  const [status] = await thoughtStatusRepository.findManyByIds([data.statusId], userId);
  if (!status) throw new Error("Status not found or unauthorized");

  return thoughtRepository.create({
    content: data.content,
    statusId: data.statusId,
    order: data.order ?? (await thoughtRepository.countInStatus(data.statusId, userId)),
    userId,
  });
}

export async function deleteThought(userId: string, id: string) {
  return thoughtRepository.delete(id, userId);
}

export async function moveThought(
  userId: string,
  thoughtId: string,
  targetStatusId: string,
  orderedIdsInTargetColumn: string[],
) {
  const [status] = await thoughtStatusRepository.findManyByIds([targetStatusId], userId);
  if (!status) throw new Error("Status not found or unauthorized");

  return thoughtRepository.moveAndReorder(
    userId,
    thoughtId,
    targetStatusId,
    orderedIdsInTargetColumn,
  );
}
