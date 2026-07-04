import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { TrainingHistoryClient } from "@/features/health/training/components/TrainingHistoryClient";
import * as trainingSessionService from "@/features/health/training/services/training-session-service";
import type { TrainingSessionSummaryData } from "@/features/health/training/types";

export const metadata: Metadata = {
  title: "Training — History",
};

export default async function TrainingHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const sessions = await trainingSessionService.getRecentSessions(userId);

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "training", href: "/health/training" },
          { label: "history" },
        ]}
        title="History"
      />
      <div className="flex flex-col gap-6">
        <TrainingHistoryClient
          initialSessions={sessions as unknown as TrainingSessionSummaryData[]}
        />
      </div>
    </div>
  );
}
