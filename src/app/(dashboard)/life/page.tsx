import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { BookText, CheckCircle2, Zap, CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Life Space",
};

export default async function LifeSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "life space",
        title: "Life Space",
        description: "Daily journal, habits, and task management.",
      }}
    >
      <SpaceDescription
        problem="Days blur together without reflection, and good intentions fade without tracking."
        solution="Daily journal with routines, habit compounding, and hierarchical task management."
        result="Consistent growth through daily discipline."
      />
      <SpaceNav
        items={[
          {
            title: "Journal",
            description: "Routines, sleep, energy & mood",
            href: "/life/journal",
            icon: BookText,
          },
          {
            title: "Tasks",
            description: "Hierarchical task management",
            href: "/life/tasks",
            icon: CheckCircle2,
          },
          {
            title: "Habits",
            description: "Daily discipline tracker",
            href: "/life/habits",
            icon: Zap,
          },
          {
            title: "Week",
            description: "Plan day types for the week",
            href: "/life/week",
            icon: CalendarDays,
          },
        ]}
      />
    </SpaceLanding>
  );
}
