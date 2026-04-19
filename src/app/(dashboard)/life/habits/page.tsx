import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { HabitsPageClient } from "@/features/life/components/habits/HabitsPageClient";
import * as habitService from "@/features/life/services/habit-service";
import type { HabitData } from "@/features/life/types";

export const metadata: Metadata = {
  title: "Habit Tracker",
};

export default async function HabitsPage() {
  const session = await auth();
  const personId = (session?.user as any)?.personId;

  if (!session || !personId) {
    redirect("/login");
  }

  const habits = await habitService.getActiveHabits(personId);
  const stats = await habitService.getHabitStats(personId);

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "life space", href: "/life" }, { label: "habit tracker" }]} />
      <HabitsPageClient 
        initialHabits={habits as unknown as HabitData[]} 
        initialStats={stats} 
      />
    </div>
  );
}
