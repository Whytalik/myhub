import type { Metadata } from "next";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { Dumbbell, Activity, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Fitness Space",
};

export default function FitnessPage() {
  return (
    <SpaceLanding
      header={{
        label: "fitness space",
        title: "Fitness Space",
        description: "Workouts, exercises, and progress tracking.",
      }}
    >
      <SpaceDescription
        problem="Workouts without structure lead to plateaus and inconsistent progress."
        solution="Exercise library, structured workout plans, and progressive overload tracking."
        result="Measurable strength and fitness gains over time."
      />
      <SpaceNav
        items={[
          {
            title: "Workouts",
            description: "Log & plan training sessions",
            href: "/fitness/workouts",
            icon: Dumbbell,
          },
          {
            title: "Exercises",
            description: "Personal exercise library",
            href: "/fitness/exercises",
            icon: Activity,
          },
          {
            title: "Progress",
            description: "Volume, PRs & body metrics",
            href: "/fitness/progress",
            icon: TrendingUp,
          },
        ]}
      />
    </SpaceLanding>
  );
}
