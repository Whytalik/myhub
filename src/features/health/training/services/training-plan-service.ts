import { getCachedTrainingPlans } from "@/lib/cache";
import { trainingPlanRepository } from "../repositories/training-plan.repository";
import { trainingDayRepository } from "../repositories/training-day.repository";
import { trainingDayExerciseRepository } from "../repositories/training-day-exercise.repository";
import { exerciseRepository } from "../repositories/exercise.repository";
import type {
  UpsertTrainingPlanInput,
  UpsertTrainingDayInput,
  UpsertDayExerciseInput,
} from "../types";

export async function getPlans(userId: string) {
  return getCachedTrainingPlans(userId);
}

export async function upsertPlan(userId: string, input: UpsertTrainingPlanInput) {
  const { id, ...data } = input;
  if (id) {
    return trainingPlanRepository.update(id, userId, data);
  }
  return trainingPlanRepository.create({ ...data, userId, order: data.order ?? 0 });
}

export async function deletePlan(userId: string, id: string) {
  return trainingPlanRepository.delete(id, userId);
}

export async function upsertDay(userId: string, input: UpsertTrainingDayInput) {
  const { id, planId, ...data } = input;
  if (id) {
    return trainingDayRepository.update(id, userId, data);
  }

  const plan = await trainingPlanRepository.findById(planId);
  if (!plan || plan.userId !== userId) throw new Error("Plan not found or unauthorized");

  const order = await trainingDayRepository.countInPlan(planId);
  return trainingDayRepository.create({ ...data, planId, userId, order });
}

export async function deleteDay(userId: string, id: string) {
  return trainingDayRepository.delete(id, userId);
}

export async function upsertDayExercise(userId: string, input: UpsertDayExerciseInput) {
  const { id, dayId, exerciseId, ...data } = input;
  if (id) {
    return trainingDayExerciseRepository.update(id, userId, data);
  }

  const day = await trainingDayRepository.findById(dayId);
  if (!day || day.userId !== userId) throw new Error("Day not found or unauthorized");

  const exercise = await exerciseRepository.findById(exerciseId);
  if (!exercise || exercise.userId !== userId)
    throw new Error("Exercise not found or unauthorized");

  const order = await trainingDayExerciseRepository.countInDay(dayId);
  return trainingDayExerciseRepository.create({
    ...data,
    dayId,
    exerciseId,
    userId,
    order,
    sets: data.sets ?? 3,
  });
}

export async function deleteDayExercise(userId: string, id: string) {
  return trainingDayExerciseRepository.delete(id, userId);
}
