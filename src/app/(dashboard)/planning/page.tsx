import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { Target, Compass, Zap, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Planning Space",
};

export default async function PlanningSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "planning space",
        title: "Planning Space",
        description: "Vision, milestones, and 12-week sprints.",
      }}
    >
      <SpaceDescription
        problem="Big goals feel overwhelming without a clear path from vision to action."
        solution="Vision → Milestones → Annual Compass → 12-Week Sprints → Weekly Reviews."
        result="Every daily action connects to your North Star."
      />
      <SpaceNav
        items={[
          {
            title: "Alignment Map",
            description: "Vision through objectives",
            href: "/planning/vision",
            icon: Target,
          },
          {
            title: "Annual Compass",
            description: "Yearly theme & focus",
            href: "/planning/compass",
            icon: Compass,
          },
          {
            title: "12-Week Sprints",
            description: "Tactical execution engine",
            href: "/planning/sprints",
            icon: Zap,
          },
          {
            title: "Review Center",
            description: "Scorecards & adjustments",
            href: "/planning/reviews",
            icon: CheckCircle2,
          },
        ]}
      />
    </SpaceLanding>
  );
}
