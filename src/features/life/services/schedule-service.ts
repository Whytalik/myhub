import { scheduleRepository } from "../repositories/schedule.repository";
import { trainingDayRepository } from "@/features/health/training/repositories/training-day.repository";
import type { UpsertDayScheduleInput } from "../types";

function toDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export async function getScheduleByDate(userId: string, date: Date) {
  return scheduleRepository.findByDayOfWeek(userId, toDayOfWeek(date));
}

export async function getAllTemplates(userId: string) {
  return scheduleRepository.findAll(userId);
}

export async function upsertSchedule(userId: string, input: UpsertDayScheduleInput) {
  if (input.trainingDayId) {
    const day = await trainingDayRepository.findById(input.trainingDayId);
    if (!day || day.userId !== userId) throw new Error("Training day not found or unauthorized");
  }
  return scheduleRepository.upsert(userId, input.dayOfWeek, input.trainingDayId);
}
