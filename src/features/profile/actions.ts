"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";

export async function updateUserNameAction(newName: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: newName },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user name:", error);
    return { success: false, error: "Failed to update name" };
  }
}

export async function setPrivateTaskPasswordAction(password: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const passwordHash = password ? await hash(password, 10) : null;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { privateTaskPasswordHash: passwordHash },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to set private task password:", error);
    return { success: false, error: "Failed to set password" };
  }
}

export async function verifyPrivateTaskPasswordAction(password: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { privateTaskPasswordHash: true },
    });

    if (!user?.privateTaskPasswordHash) {
      return { success: false, error: "Password not set" };
    }

    const isValid = await compare(password, user.privateTaskPasswordHash);
    return { success: isValid, error: isValid ? undefined : "Invalid password" };
  } catch (error) {
    console.error("Failed to verify private task password:", error);
    return { success: false, error: "Failed to verify password" };
  }
}
