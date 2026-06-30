"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import bcrypt from "bcryptjs";

export async function registerAction(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Цей email вже використовується" };

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, passwordHash: hash } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/life" });
  } catch (error) {
    throw error;
  }
}
