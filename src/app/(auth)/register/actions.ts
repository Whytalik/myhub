"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function registerAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!email || !password || !name) return "Fill in all fields.";
  if (password.length < 6) return "Password must be at least 6 characters.";

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return "User with this email already exists.";

    const passwordHash = await hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      const profile = await tx.profile.create({
        data: {
          name: `${name}'s Profile`,
          userId: user.id,
        },
      });

      await tx.person.create({
        data: {
          name: name,
          profileId: profile.id,
        },
      });
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return error?.message || "Something went wrong. Please try again.";
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Failed to sign in after registration.";
    }
    throw error;
  }

  return null;
}
