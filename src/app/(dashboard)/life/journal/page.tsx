import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { getEntryByDate } from "@/features/life/services/journal-service";
import * as taskService from "@/features/life/services/task-service";
import * as habitService from "@/features/life/services/habit-service";
import { getScheduleByDate } from "@/features/life/services/schedule-service";
import { DailyEntryForm } from "@/features/life/components/DailyEntryForm";
import type { DailyEntryData, HabitData, DayType } from "@/features/life/types";
import type { RoutineMap } from "@/lib/routine-items";
import { History } from "lucide-react";

export const metadata: Metadata = {
  title: "Daily Journal",
};

function currentTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default async function JournalPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const dateStr = currentTodayStr();

  // Create UTC date from YYYY-MM-DD to match database storage
  const date = new Date(dateStr);
  const [raw, tasks, spheres, habits, schedule] = await Promise.all([
    getEntryByDate(userId, date),
    taskService.getTasksByDate(userId, date),
    taskService.getAllSpheres(userId),
    habitService.getActiveHabits(userId),
    getScheduleByDate(userId, date),
  ]);

  const entry: DailyEntryData | null = raw
    ? { 
        ...raw, 
        morningRoutine: (raw.morningRoutine as RoutineMap | null) ?? null,
        eveningRoutine: (raw.eveningRoutine as RoutineMap | null) ?? null 
      }
    : null;

  return (
    <div>
      <div className="relative">
        <PageHeader
          breadcrumb={[{ label: "life space", href: "/life" }, { label: "daily journal" }]}
          title="Daily Journal"
          description="Daily reflection, tracking, and intention."
        />
        <Link
          href="/life/history"
          className="absolute top-0 right-0 inline-flex items-center gap-2 h-8 px-5 rounded-xl text-note font-mono uppercase tracking-wider border border-border bg-transparent hover:bg-raised text-secondary hover:text-text transition-all"
        >
          <History size={14} />
          History
        </Link>
      </div>

      <DailyEntryForm
        key={dateStr}
        initialEntry={entry}
        todayStr={dateStr}
        tasks={tasks}
        spheres={spheres}
        habits={habits as unknown as HabitData[]}
        scheduledDayType={schedule ? (schedule.dayType as DayType) : undefined}
      />
    </div>
  );
}
