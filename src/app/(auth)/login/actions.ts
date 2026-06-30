"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginWithCredentialsAction(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirectTo: "/life" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Невірний email або пароль" };
    }
    throw error;
  }
}
