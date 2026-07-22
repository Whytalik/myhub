import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { getAllTemplates } from "@/features/life/services/schedule-service";
import { getPlans } from "@/features/health/training/services/training-plan-service";
import { WeekScheduleClient } from "@/features/life/components/WeekScheduleClient";
import type { DayScheduleData } from "@/features/life/types";

export const metadata: Metadata = {
  title: "Week Template",
};

export default async function WeekSchedulePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const [raw, plans] = await Promise.all([getAllTemplates(userId), getPlans(userId)]);

  const templates: DayScheduleData[] = raw.map((template) => ({
    id: template.id,
    dayOfWeek: template.dayOfWeek,
    trainingDayId: template.trainingDayId,
    trainingDayName: template.trainingDay?.name ?? null,
    contextBlocks: template.contextBlocks,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  }));

  const trainingDays = plans.flatMap((p) => p.days.map((d) => ({ id: d.id, name: d.name })));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "week template" }]}
        title="Week Template"
        description="Assign a training day to each weekday — it also shows up in the Journal."
      />

      <WeekScheduleClient initialTemplates={templates} trainingDays={trainingDays} />
    </div>
  );
}
