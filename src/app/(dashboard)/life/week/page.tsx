import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Heading } from "@/components/ui/heading";
import { getSchedulesForWeek } from "@/features/life/services/schedule-service";
import { WeekScheduleClient } from "@/features/life/components/WeekScheduleClient";
import type { DayScheduleData, DayType } from "@/features/life/types";

export const metadata: Metadata = {
  title: "Week Schedule",
};

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function WeekSchedulePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const weekStart = getMonday(new Date());
  const raw = await getSchedulesForWeek(userId, weekStart);

  const schedules: DayScheduleData[] = raw.map((s) => ({
    id: s.id,
    date: s.date,
    dayType: s.dayType as DayType,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  const weekStartStr = weekStart.toISOString();

  return (
    <div className="px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading title="Week Schedule" />
        <p className="text-note font-mono text-muted tracking-widest pl-1 italic">
          Plan your week — routines auto-load in the Journal.
        </p>
      </div>

      <WeekScheduleClient
        initialSchedules={schedules}
        initialWeekStart={weekStartStr}
      />
    </div>
  );
}
