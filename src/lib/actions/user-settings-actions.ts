"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function updateDailyResistanceBudget(
  budget: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (budget < 5 || budget > 20) {
      return { success: false, error: "Budget must be between 5 and 20" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { dailyResistanceBudget: budget },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update daily resistance budget:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function getDailyResistanceBudget(): Promise<number> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return 8; // Default
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyResistanceBudget: true },
    });

    return user?.dailyResistanceBudget ?? 8;
  } catch (error) {
    console.error("Failed to get daily resistance budget:", error);
    return 8;
  }
}
