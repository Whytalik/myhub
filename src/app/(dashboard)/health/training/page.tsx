import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { TrainingPageClient } from "@/features/health/training/components/TrainingPageClient";
import * as exerciseService from "@/features/health/training/services/exercise-service";
import * as trainingPlanService from "@/features/health/training/services/training-plan-service";
import * as trainingSessionService from "@/features/health/training/services/training-session-service";
import type {
  ExerciseData,
  TrainingPlanData,
  TrainingSessionSummaryData,
} from "@/features/health/training/types";

export const metadata: Metadata = {
  title: "Training",
};

export default async function TrainingPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [exercises, plans, sessions] = await Promise.all([
    exerciseService.getExercises(userId),
    trainingPlanService.getPlans(userId),
    trainingSessionService.getRecentSessions(userId),
  ]);

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "training" }]}
        title="Training"
        description="Build your plans, prescribe your sets, then log what you actually did."
      />
      <TrainingPageClient
        initialExercises={exercises as unknown as ExerciseData[]}
        initialPlans={plans as unknown as TrainingPlanData[]}
        initialSessions={sessions as unknown as TrainingSessionSummaryData[]}
      />
    </div>
  );
}
