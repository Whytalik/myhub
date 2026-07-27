import { getCachedActiveHabits } from "@/lib/cache/cache";
import { habitRepository } from "../repositories/habit.repository";
import type { UpsertHabitInput } from "../types";

function generateName(input: UpsertHabitInput): string {
  const anchor = input.anchor?.trim() || "";
  const action = input.action?.trim() || "";
  if (input.type !== "avoidance" && anchor && action) {
    const name = `${anchor} → ${action}`;
    return name.length > 80 ? name.slice(0, 77) + "..." : name;
  }
  return action || anchor || "New habit";
}

export async function getActiveHabits(userId: string) {
  return getCachedActiveHabits(userId);
}

export async function upsertHabit(userId: string, input: UpsertHabitInput) {
  const { id, ...data } = input;

  if (id) {
    return habitRepository.update(id, userId, data);
  }

  if (!data.name || !data.name.trim()) {
    data.name = generateName(input);
  }

  return habitRepository.create({
    ...data,
    name: data.name!,
    anchor: data.anchor ?? "",
    action: data.action ?? "",
    userId,
    order: data.order ?? 0,
  });
}

export async function toggleHabitArchived(userId: string, id: string) {
  const habit = await habitRepository.findById(id);
  if (!habit || habit.userId !== userId) throw new Error("Habit not found or unauthorized");
  return habitRepository.update(id, userId, { archived: !habit.archived });
}

export async function deleteHabit(userId: string, id: string) {
  return habitRepository.delete(id, userId);
}

export async function toggleHabitCompletion(userId: string, habitId: string, date: Date | string) {
  const habit = await habitRepository.findById(habitId);
  if (!habit || habit.userId !== userId) throw new Error("Habit not found or unauthorized");

  let targetDate: Date;
  if (typeof date === "string") {
    const [year, month, day] = date.split("-").map(Number);
    targetDate = new Date(Date.UTC(year, month - 1, day));
  } else {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    targetDate = new Date(Date.UTC(year, month, day));
  }

  const existing = await habitRepository.findCompletion(habitId, targetDate);

  if (existing) {
    return habitRepository.deleteCompletion(existing.id);
  }
  return habitRepository.createCompletion(habitId, targetDate);
}
