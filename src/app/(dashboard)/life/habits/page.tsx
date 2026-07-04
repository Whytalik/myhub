import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { HabitsPageClient } from "@/features/life/components/habits/HabitsPageClient";
import * as habitService from "@/features/life/services/habit-service";
import * as habitChainService from "@/features/life/services/habit-chain-service";
import * as taskService from "@/features/life/services/task-service";
import type { HabitData, HabitChainData } from "@/features/life/types";

export const metadata: Metadata = {
  title: "Habit Tracker",
};

export default async function HabitsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [habits, chains, spheres] = await Promise.all([
    habitService.getActiveHabits(userId),
    habitChainService.getActiveChains(userId),
    taskService.getAllSpheres(userId),
  ]);

  return (
    <div >
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "habits" }]}
        title="Habit Tracker"
        description="Small disciplines compound into extraordinary results."
      />
      <HabitsPageClient
        initialHabits={habits as unknown as HabitData[]}
        initialChains={chains as unknown as HabitChainData[]}
        spheres={spheres}
      />
    </div>
  );
}
