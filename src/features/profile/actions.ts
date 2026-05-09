"use server";

import { prisma } from "@/lib/prisma";
import { invalidateProfileCache } from "@/lib/revalidate";
import { withAction, getRequiredUserId, ActionResult } from "@/lib/action-utils";
import { hash, compare } from "bcryptjs";

export async function updateUserNameAction(newName: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await prisma.user.update({ where: { id: userId }, data: { name: newName } });
    invalidateProfileCache(userId);
  });
}

export async function setPrivateTaskPasswordAction(password: string | null): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    const passwordHash = password ? await hash(password, 10) : null;
    await prisma.user.update({ where: { id: userId }, data: { privateTaskPasswordHash: passwordHash } });
    invalidateProfileCache(userId);
  });
}

export async function verifyPrivateTaskPasswordAction(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getRequiredUserId();
    const { getCachedPrivateTaskPasswordHash } = await import("@/lib/cache");
    const user = await getCachedPrivateTaskPasswordHash(userId);

    if (!user?.privateTaskPasswordHash) {
      return { success: false, error: "Password not set" };
    }

    const isValid = await compare(password, user.privateTaskPasswordHash);
    return { success: isValid, error: isValid ? undefined : "Invalid password" };
  } catch {
    return { success: false, error: "Failed to verify password" };
  }
}
