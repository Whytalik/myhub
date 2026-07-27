import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import * as exerciseService from "@/features/health/training/services/exercise-service";
import { EXERCISE_DETAILS } from "@/features/health/training/data/exercise-details";
import { ExerciseDetailClient } from "@/features/health/training/components/ExerciseDetailClient";
import type { TrackingType } from "@/features/health/training/types";

interface ExerciseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExerciseDetailPageProps): Promise<Metadata> {
  const session = await auth();
  const userId = session?.user?.id;
  const { id } = await params;
  if (!userId) return { title: "Exercise Details" };

  const exercise = await exerciseService.getExercise(userId, id);
  return {
    title: exercise ? `Exercise — ${exercise.name}` : "Exercise Not Found",
  };
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const exercise = await exerciseService.getExercise(userId, id);

  if (!exercise) {
    notFound();
  }

  const details = EXERCISE_DETAILS[exercise.name];

  return (
    <ExerciseDetailClient
      exercise={{
        ...exercise,
        trackingType: exercise.trackingType as TrackingType,
      }}
      staticDetails={details}
    />
  );
}
