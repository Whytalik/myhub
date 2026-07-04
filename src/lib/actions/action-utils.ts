import { auth } from "@/auth";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getRequiredUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function withAction<T>(
  fn: (userId: string) => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const userId = await getRequiredUserId();
    const data = await fn(userId);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
