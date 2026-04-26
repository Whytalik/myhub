import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpaceLanding, SpaceError, ModuleQuickAccess, StatsSummary, QuickActions } from "@/components/space-landing";
import { Compass, Target, Zap, CheckCircle2, Brain, Plus, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Planning Space",
};

async function fetchPlanningData(userId: string) {
  const today = new Date();

  const [activeSprint, objectives, milestones, sprintCount] = await Promise.all([
    prisma.sprint.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { startDate: "desc" },
    }),
    prisma.objective.count({
      where: { sprint: { userId, status: "ACTIVE" }, status: "IN_PROGRESS" },
    }),
    prisma.milestone.count({ where: { userId, completed: false } }),
    prisma.sprint.count({ where: { userId } }),
  ]);

  return { activeSprint, objectives, milestones, sprintCount, today };
}

export default async function PlanningSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  let planningData: Awaited<ReturnType<typeof fetchPlanningData>> | null = null;
  let error: Error | null = null;

  try {
    planningData = await fetchPlanningData(userId);
  } catch (e) {
    console.error("[PlanningSpace] Failed to load:", e);
    error = e instanceof Error ? e : new Error(String(e));
  }

  const modules = [
    {
      title: "Vision & Milestones",
      href: "/planning/vision",
      description: "Ultimate North Star (10-25 years) and Strategic 3-Year Milestones. The 'Why' and 'Where'.",
      icon: Target,
      badge: "Level 01 & 02",
    },
    {
      title: "Annual Compass",
      href: "/planning/compass",
      description: "Annual Theme and Strategic Focus for the current calendar year. The 'Flavor' of your growth.",
      icon: Compass,
      badge: "Level 03",
    },
    {
      title: "12-Week Sprints",
      href: "/planning/sprints",
      description: "Tactical execution engine. Quarterly Objectives and Key Results (OKRs). The 'What'.",
      icon: Zap,
      badge: "Level 04",
    },
    {
      title: "Review Center",
      href: "/planning/reviews",
      description: "Weekly Scorecards, accountability logs, and tactical adjustments. The 'How'.",
      icon: CheckCircle2,
      badge: "Level 05",
    },
  ];

  if (error) {
    return (
      <SpaceLanding
        header={{
          label: "planning space",
          title: "Planning Space",
          description: "The alignment engine of your Personal OS. Bridge the gap between abstract dreams and daily execution using the 5-Level Structure.",
        }}
      >
        <SpaceError
          message="Failed to load space data. Please try refreshing the page later."
          developerError={error.message}
        />
      </SpaceLanding>
    );
  }

  const d = planningData!;
  const sprintLabel = d.activeSprint
    ? `Sprint ${d.activeSprint.number}/${d.activeSprint.year}`
    : "No active sprint";

  const daysLeft = d.activeSprint
    ? Math.max(0, Math.ceil((d.activeSprint.endDate.getTime() - d.today.getTime()) / (1000 * 60 * 60 * 24)))
    : "—";

  return (
    <SpaceLanding
      header={{
        label: "planning space",
        title: "Planning Space",
        description: "The alignment engine of your Personal OS. Bridge the gap between abstract dreams and daily execution using the 5-Level Structure.",
      }}
      intelligence={{
        items: [
          { label: "Structure", value: "5-Level Hierarchy" },
          { label: "Method", value: "OKR + Sprint" },
          { label: "Cycle", value: "12-Week Sprints" },
          { label: "Review", value: "Weekly Scorecards" },
        ],
      }}
    >
      <StatsSummary
        stats={[
          { label: "Active Sprint", value: sprintLabel, icon: Zap, href: "/planning/sprints" },
          { label: "Objectives", value: d.objectives.toString(), icon: Target },
          { label: "Milestones", value: d.milestones.toString(), icon: Compass },
          { label: "Days Left", value: daysLeft.toString(), icon: Eye },
        ]}
      />
      <QuickActions
        actions={[
          {
            label: "View Vision",
            href: "/planning/vision",
            icon: Brain,
            variant: d.sprintCount > 0 ? "secondary" : "primary",
          },
          {
            label: "New Sprint",
            href: "/planning/sprints",
            icon: Plus,
            variant: d.sprintCount > 0 ? "secondary" : "secondary",
          },
        ]}
      />
      <ModuleQuickAccess modules={modules} />
    </SpaceLanding>
  );
}
