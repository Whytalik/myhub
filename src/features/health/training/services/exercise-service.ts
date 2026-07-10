import { getCachedExercises } from "@/lib/cache/cache";
import { exerciseRepository } from "../repositories/exercise.repository";
import type { UpsertExerciseInput } from "../types";

export async function getExercises(userId: string) {
  return getCachedExercises(userId);
}

export async function upsertExercise(userId: string, input: UpsertExerciseInput) {
  const { id, ...data } = input;
  if (id) {
    return exerciseRepository.update(id, userId, data);
  }
  return exerciseRepository.create({ ...data, userId, order: data.order ?? 0 });
}

export async function deleteExercise(userId: string, id: string) {
  return exerciseRepository.delete(id, userId);
}

export async function getExercise(userId: string, id: string) {
  const exercise = await exerciseRepository.findById(id);
  if (!exercise || exercise.userId !== userId) {
    return null;
  }
  return exercise;
}
