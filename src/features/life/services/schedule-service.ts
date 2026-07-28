import { scheduleRepository } from "../repositories/schedule.repository";
import { trainingDayRepository } from "@/features/health/training/repositories/training-day.repository";
import type { UpsertDayScheduleInput, ContextBlock } from "../types";
import { getDayOfWeekInAppTimeZone, getDefaultBlocks } from "../logic/context-blocks";

export async function getScheduleByDate(userId: string, date: Date) {
  const template = await scheduleRepository.findByDayOfWeek(
    userId,
    getDayOfWeekInAppTimeZone(date),
  );
  if (!template) {
    return null;
  }
  return {
    ...template,
    contextBlocks:
      (template.contextBlocks as ContextBlock[] | null) || getDefaultBlocks(template.dayOfWeek),
  };
}

export async function getAllTemplates(userId: string) {
  const templates = await scheduleRepository.findAll(userId);
  return templates.map((template) => ({
    ...template,
    contextBlocks:
      (template.contextBlocks as ContextBlock[] | null) || getDefaultBlocks(template.dayOfWeek),
  }));
}

export async function upsertSchedule(userId: string, input: UpsertDayScheduleInput) {
  if (input.trainingDayId) {
    const day = await trainingDayRepository.findById(input.trainingDayId);
    if (!day || day.userId !== userId) {
      throw new Error("Training day not found or unauthorized");
    }
  }
  return scheduleRepository.upsert(
    userId,
    input.dayOfWeek,
    input.trainingDayId,
    input.contextBlocks ? JSON.parse(JSON.stringify(input.contextBlocks)) : undefined,
  );
}
