import { toast } from "sonner";
import { getVoteMomentAction } from "@/features/life/actions/year-focus-actions";

// The self-confirmation beat after finishing something: acknowledge the promise kept and
// show the running vote count. Silent unless the item belongs to the focus sphere.
export async function announceIdentityVote(source: { taskId?: string; habitId?: string }) {
  const result = await getVoteMomentAction(source);
  if (!result.success || !result.data) return;
  toast("Я сказав, що зроблю, і зробив.", {
    description: `Голос №${result.data.total}: ${result.data.identity}`,
    duration: 6000,
  });
}
