import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { Utensils, Dumbbell } from "lucide-react";

export const metadata: Metadata = {
  title: "Health Domain",
};

export default async function HealthPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "health",
        title: "Health",
        description: "Physical foundation of performance.",
      }}
    >
      <SpaceDescription
        problem="Physical performance degrades without intentional management of nutrition, movement, and recovery."
        solution="Quantified tracking of meals, macros, workouts, and vital metrics in one place."
        result="Sustained energy, better body composition, and long-term health."
      />
      <SpaceNav
        items={[
          {
            title: "Nutrition Space",
            description: "Meal planning & macros",
            href: "/nutrition",
            icon: Utensils,
          },
          {
            title: "Fitness Space",
            description: "Workouts & progress",
            href: "/fitness",
            icon: Dumbbell,
          },
        ]}
      />
    </SpaceLanding>
  );
}
