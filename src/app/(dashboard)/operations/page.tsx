import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, ModuleQuickAccess } from "@/components/space-landing";
import { Compass, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Operations Domain",
};

export default async function OperationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "operations",
        title: "Strategy & Execution",
        description: "Operations is the engine of your Personal OS. It bridges the gap between qualitative vision and daily actions through a structured 5-level hierarchy.",
      }}
      intelligence={{
        items: [
          { label: "System Mission", value: "Alignment" },
          { label: "Current Cycle", value: "Q2" },
          { label: "Performance", value: "90%+" },
        ],
      }}
    >
      <ModuleQuickAccess
        modules={[
          {
            title: "Planning Space",
            href: "/planning",
            description: "Level 1-5 Strategic Framework. North Star, Milestones, and 12-Week Cycles.",
            icon: Compass,
            status: "Active",
          },
          {
            title: "Life Space",
            href: "/life",
            description: "Execution engine. Daily journal, habit compounding, and task management.",
            icon: Sparkles,
            status: "Active",
          },
        ]}
      />
    </SpaceLanding>
  );
}
