import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { HabitsPageClient } from "@/features/life/components/habits/HabitsPageClient";
import * as habitService from "@/features/life/services/habit-service";
import * as taskService from "@/features/life/services/task-service";
import type { HabitData } from "@/features/life/types";

export const metadata: Metadata = {
  title: "Habit Tracker",
};

export default async function HabitsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [habits, spheres] = await Promise.all([
    habitService.getActiveHabits(userId),
    taskService.getAllSpheres(userId),
  ]);

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "habits" }]}
        title="Habit Tracker"
        description="Small disciplines compound into extraordinary results."
      />
      <HabitsPageClient
        initialHabits={habits as unknown as HabitData[]}
        spheres={spheres}
      />
    </div>
  );
}
