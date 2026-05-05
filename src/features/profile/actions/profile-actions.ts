"use server";

import { revalidatePath } from "next/cache";
import * as profileService from "../services/profile-service";
import { ActionResult, withAction } from "@/lib/action-utils";

export async function updateProfileAction(_state: unknown, formData: FormData): Promise<ActionResult<void>> {
  const name = formData.get("name") as string;
  if (!name) return { success: false, error: "Name is required" };
  return withAction(async (userId) => {
    await profileService.updateUserProfile(userId, { name });
    revalidatePath("/profile");
    revalidatePath("/");
  });
}
