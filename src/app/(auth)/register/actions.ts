"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const DEFAULT_SPHERES = [
  { name: "Health", color: "#22c55e", icon: "Heart", order: 0 },
  { name: "Work", color: "#3b82f6", icon: "Briefcase", order: 1 },
  { name: "Family", color: "#f59e0b", icon: "Users", order: 2 },
  { name: "Finance", color: "#10b981", icon: "DollarSign", order: 3 },
  { name: "Personal Growth", color: "#8b5cf6", icon: "BookOpen", order: 4 },
  { name: "Fun", color: "#ec4899", icon: "Smile", order: 5 },
];

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

      await tx.nutritionPerson.create({
        data: {
          userId: user.id,
          name: name,
        } as never,
      });

      for (const sphere of DEFAULT_SPHERES) {
        await tx.lifeSphere.create({
          data: {
            userId: user.id,
            name: sphere.name,
            color: sphere.color,
            icon: sphere.icon,
            order: sphere.order,
          },
        });
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return error instanceof Error ? error.message : "Something went wrong. Please try again.";
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
