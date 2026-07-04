import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { TrainingPlansClient } from "@/features/health/training/components/TrainingPlansClient";
import * as exerciseService from "@/features/health/training/services/exercise-service";
import * as trainingPlanService from "@/features/health/training/services/training-plan-service";
import type { ExerciseData, TrainingPlanData } from "@/features/health/training/types";

export const metadata: Metadata = {
  title: "Training — Plans",
};

export default async function TrainingPlansPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [exercises, plans] = await Promise.all([
    exerciseService.getExercises(userId),
    trainingPlanService.getPlans(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "training" }]}
        title="Plans"
      />
      <TrainingPlansClient
        initialPlans={plans as unknown as TrainingPlanData[]}
        initialExercises={exercises as unknown as ExerciseData[]}
      />
    </div>
  );
}
