import { auth } from "@/auth";
import { invalidateTrainingPlanCache } from "@/lib/cache/revalidate";

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  invalidateTrainingPlanCache(userId);
  return Response.json({ ok: true });
}
