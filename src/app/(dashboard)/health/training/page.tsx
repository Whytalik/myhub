import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { TrainingPlansClient } from "@/features/health/training/components/TrainingPlansClient";
import * as exerciseService from "@/features/health/training/services/exercise-service";
import * as trainingPlanService from "@/features/health/training/services/training-plan-service";
import { getAllTemplates } from "@/features/life/services/schedule-service";
import type { ExerciseData, TrainingPlanData } from "@/features/health/training/types";

export const metadata: Metadata = {
  title: "Training — Plan",
};

export default async function TrainingPlansPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [exercises, plans, templates] = await Promise.all([
    exerciseService.getExercises(userId),
    trainingPlanService.getPlans(userId),
    getAllTemplates(userId),
  ]);

  const weekAssignments: Record<number, string | null> = {};
  for (const t of templates) {
    weekAssignments[t.dayOfWeek] = t.trainingDayId;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "training" }]}
        title="Plan"
      />
      <TrainingPlansClient
        initialPlans={plans as unknown as TrainingPlanData[]}
        initialExercises={exercises as unknown as ExerciseData[]}
        initialWeekAssignments={weekAssignments}
      />
    </div>
  );
}
