import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { ReviewSessionClient } from "@/features/life/components/thoughts/ReviewSessionClient";
import * as thoughtService from "@/features/life/services/thought-service";
import * as missionService from "@/features/life/services/mission-service";
import type { ThoughtData, ThoughtStatusData } from "@/features/life/types";

export const metadata: Metadata = { title: "Review" };

export default async function ReviewPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const [board, mission] = await Promise.all([
    thoughtService.getBoard(userId) as unknown as Promise<ThoughtStatusData[]>,
    missionService.getCurrentMission(userId),
  ]);

  const inboxThoughts: ThoughtData[] =
    board.find((status) => status.name === "Inbox")?.thoughts ?? [];

  // Already-accepted thoughts, shown as reference context for the "does this
  // conflict with something I already committed to?" step.
  const activeThoughts: ThoughtData[] = board
    .filter((status) => status.name === "Хочу" || status.name === "Повинен")
    .flatMap((status) => status.thoughts);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning" },
          { label: "review" },
        ]}
        title="Review"
        description="Walk every Inbox thought through the three-question filter."
      />
      <ReviewSessionClient
        initialThoughts={inboxThoughts}
        missionContent={mission?.content ?? null}
        activeThoughts={activeThoughts}
      />
    </div>
  );
}
