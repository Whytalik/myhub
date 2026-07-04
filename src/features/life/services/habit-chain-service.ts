import { getCachedActiveHabitChains } from "@/lib/cache";
import { habitChainRepository } from "../repositories/habit-chain.repository";
import { habitRepository } from "../repositories/habit.repository";
import type { UpsertHabitChainInput } from "../types";

export async function getActiveChains(userId: string) {
  return getCachedActiveHabitChains(userId);
}

export async function upsertChain(userId: string, input: UpsertHabitChainInput) {
  const { id, ...data } = input;
  if (id) {
    return habitChainRepository.update(id, userId, data);
  }
  return habitChainRepository.create({ ...data, userId, order: data.order ?? 0 });
}

export async function deleteChain(userId: string, id: string) {
  return habitChainRepository.delete(id, userId);
}

export async function reorderHabitsInChain(
  userId: string,
  chainId: string,
  orderedHabitIds: string[],
) {
  const chain = await habitChainRepository.findById(chainId);
  if (!chain || chain.userId !== userId) throw new Error("Chain not found or unauthorized");

  const habits = await habitRepository.findManyByIds(orderedHabitIds, userId);
  if (habits.length !== orderedHabitIds.length || habits.some((h) => h.chainId !== chainId)) {
    throw new Error("Habit not found or unauthorized");
  }

  return habitRepository.reorderInChain(userId, orderedHabitIds);
}
