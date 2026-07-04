import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { SessionClient } from "@/features/health/training/components/SessionClient";
import * as trainingSessionService from "@/features/health/training/services/training-session-service";
import type { TrainingSessionData } from "@/features/health/training/types";

export const metadata: Metadata = {
  title: "Training Session",
};

export default async function TrainingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  let trainingSession;
  try {
    trainingSession = await trainingSessionService.getSession(userId, id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "training", href: "/health/training" },
          { label: trainingSession.dayName },
        ]}
        title={trainingSession.dayName}
        description={new Date(trainingSession.date).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />
      <SessionClient session={trainingSession as unknown as TrainingSessionData} />
    </div>
  );
}
