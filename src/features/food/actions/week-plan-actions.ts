"use server";

import { revalidatePath } from "next/cache";
import * as weekPlanService from "../services/week-plan-service";
import { CreateWeekPlanInput } from "../types";
import { auth } from "@/auth";

export async function createWeekPlanAction(data: CreateWeekPlanInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const plan = await weekPlanService.createWeekPlan(userId, data);
  revalidatePath("/food");
  return plan;
}

export async function deleteWeekPlanAction(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  await weekPlanService.deleteWeekPlan(userId, id);
  revalidatePath("/food");
}
