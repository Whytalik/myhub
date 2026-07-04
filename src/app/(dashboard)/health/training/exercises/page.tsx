import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
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
    <div >
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "training", href: "/health/training" },
          { label: "exercises" },
        ]}
        title="Exercises"
      />
      <div >
        <TrainingExercisesClient initialExercises={exercises as unknown as ExerciseData[]} />
      </div>
    </div>
  );
}
