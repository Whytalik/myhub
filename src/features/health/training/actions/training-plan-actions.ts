"use server";

import * as trainingPlanService from "../services/training-plan-service";
import { invalidateTrainingPlanCache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
import type {
  UpsertTrainingPlanInput,
  UpsertTrainingDayInput,
  UpsertDayExerciseInput,
} from "../types";

export async function upsertTrainingPlanAction(
  data: UpsertTrainingPlanInput,
): Promise<ActionResult<Awaited<ReturnType<typeof trainingPlanService.upsertPlan>>>> {
  return withAction(async (userId) => {
    const plan = await trainingPlanService.upsertPlan(userId, data);
    invalidateTrainingPlanCache(userId);
    return plan;
  });
}

export async function deleteTrainingPlanAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await trainingPlanService.deletePlan(userId, id);
    invalidateTrainingPlanCache(userId);
  });
}

export async function upsertTrainingDayAction(
  data: UpsertTrainingDayInput,
): Promise<ActionResult<Awaited<ReturnType<typeof trainingPlanService.upsertDay>>>> {
  return withAction(async (userId) => {
    const day = await trainingPlanService.upsertDay(userId, data);
    invalidateTrainingPlanCache(userId);
    return day;
  });
}

export async function deleteTrainingDayAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await trainingPlanService.deleteDay(userId, id);
    invalidateTrainingPlanCache(userId);
  });
}

export async function upsertDayExerciseAction(
  data: UpsertDayExerciseInput,
): Promise<ActionResult<Awaited<ReturnType<typeof trainingPlanService.upsertDayExercise>>>> {
  return withAction(async (userId) => {
    const dayExercise = await trainingPlanService.upsertDayExercise(userId, data);
    invalidateTrainingPlanCache(userId);
    return dayExercise;
  });
}

export async function deleteDayExerciseAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await trainingPlanService.deleteDayExercise(userId, id);
    invalidateTrainingPlanCache(userId);
  });
}
