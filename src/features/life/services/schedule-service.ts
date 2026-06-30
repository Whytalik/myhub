import { scheduleRepository } from "../repositories/schedule.repository";
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
  return scheduleRepository.upsert(userId, input.dayOfWeek, input.dayType);
}
