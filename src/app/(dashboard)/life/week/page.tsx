import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { getAllTemplates } from "@/features/life/services/schedule-service";
import { WeekScheduleClient } from "@/features/life/components/WeekScheduleClient";
import type { DayScheduleData, DayType } from "@/features/life/types";

export const metadata: Metadata = {
  title: "Week Template",
};

export default async function WeekSchedulePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const raw = await getAllTemplates(userId);

  const templates: DayScheduleData[] = raw.map((t) => ({
    id: t.id,
    dayOfWeek: t.dayOfWeek,
    dayType: t.dayType as DayType,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return (
    <div >
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "week template" }]}
        title="Week Template"
        description="Set your default day types — auto-loaded in the Journal each day."
      />

      <WeekScheduleClient initialTemplates={templates} />
    </div>
  );
}
