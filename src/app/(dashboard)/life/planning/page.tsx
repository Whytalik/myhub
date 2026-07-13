import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { ThoughtsBoardClient } from "@/features/life/components/thoughts/ThoughtsBoardClient";
import * as thoughtService from "@/features/life/services/thought-service";
import type { ThoughtStatusData } from "@/features/life/types";

export const metadata: Metadata = { title: "Thoughts" };

export default async function PlanningPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  let statuses: ThoughtStatusData[] = [];

  try {
    statuses = (await thoughtService.getBoard(userId)) as unknown as ThoughtStatusData[];
  } catch (error) {
    console.error("Critical error in PlanningPage:", error);
    return (
      <div className="glass-card p-6 flex flex-col gap-3">
        <h1 className="text-panel-title text-rose-400">Failed to load Thoughts</h1>
        <p className="text-caption">
          There was an internal error loading your data. Please check the logs.
        </p>
        <div className="rounded-lg bg-black/25 border border-white/[0.08] p-3">
          <code className="text-xs font-mono text-rose-400">{(error as Error).message}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "planning" }]}
        title="Thoughts"
        description="Capture ideas and move them across statuses you define."
      />
      <ThoughtsBoardClient initialStatuses={statuses} />
    </div>
  );
}
