"use server";

import { revalidatePath } from "next/cache";
import * as personService from "../services/person-service";
import { ActionResult } from "../types";
import { auth } from "@/auth";

export async function createPersonAction(name: string): Promise<ActionResult> {
  const session = await auth();
  const profileId = (session?.user as any)?.profileId;
  if (!profileId) return { success: false, error: "Unauthorized" };

  if (!name) {
    return { success: false, error: "Name is required" };
  }
  try {
    const person = await personService.createPerson(profileId, name);
    revalidatePath("/food/profiles");
    return { success: true, data: JSON.parse(JSON.stringify(person)) };
  } catch (error: unknown) {
    console.error("Error creating person:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create profile" };
  }
}

export async function updatePersonGoalsAction(id: string, goals: {
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
  targetFiber?: number;
}): Promise<ActionResult> {
  const session = await auth();
  const profileId = (session?.user as any)?.profileId;
  if (!profileId) return { success: false, error: "Unauthorized" };

  try {
    const person = await personService.updatePersonGoals(profileId, id, goals);
    revalidatePath("/food/profiles");
    return { success: true, data: JSON.parse(JSON.stringify(person)) };
  } catch (error: unknown) {
    console.error("Error updating person goals:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update goal" };
  }
}

export async function deletePersonAction(id: string): Promise<ActionResult> {
  const session = await auth();
  const profileId = (session?.user as any)?.profileId;
  if (!profileId) return { success: false, error: "Unauthorized" };

  try {
    await personService.deletePerson(profileId, id);
    revalidatePath("/food/profiles");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting person:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete profile" };
  }
}
