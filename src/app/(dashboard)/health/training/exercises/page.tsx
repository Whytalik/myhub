import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { TrainingSpaceTabs } from "@/features/health/training/components/TrainingSpaceTabs";
import { TrainingExercisesClient } from "@/features/health/training/components/TrainingExercisesClient";
import * as exerciseService from "@/features/health/training/services/exercise-service";
import type { ExerciseData } from "@/features/health/training/types";

export const metadata: Metadata = {
  title: "Training — Exercises",
};

export default async function TrainingExercisesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const exercises = await exerciseService.getExercises(userId);

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "training", href: "/health/training" },
          { label: "exercises" },
        ]}
        title="Exercises"
      />
      <div className="flex flex-col gap-6">
        <TrainingSpaceTabs />
        <TrainingExercisesClient
          initialExercises={exercises as unknown as ExerciseData[]}
        />
      </div>
    </div>
  );
}
