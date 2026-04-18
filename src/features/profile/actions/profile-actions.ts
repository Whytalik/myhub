"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import * as profileService from "../services/profile-service";

export async function updateProfileAction(_state: unknown, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  if (!name) return { success: false, error: "Name is required" };

  try {
    await profileService.updateUserProfile(userId, { name });
    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
