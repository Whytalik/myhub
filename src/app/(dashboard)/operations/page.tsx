import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
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
        title: "Operations",
        description: "The engine of your Personal OS.",
      }}
    >
      <SpaceDescription
        problem="Vision without execution is just dreaming. Most systems fail at the bridge between strategy and daily action."
        solution="A 5-level hierarchy from North Star to daily actions, powered by 12-week sprint cycles."
        result="Clear direction, measurable progress, and consistent execution."
      />
      <SpaceNav
        items={[
          {
            title: "Planning Space",
            description: "Align vision with cycles",
            href: "/planning",
            icon: Compass,
          },
          {
            title: "Life Space",
            description: "Journal, habits & tasks",
            href: "/life",
            icon: Sparkles,
          },
        ]}
      />
    </SpaceLanding>
  );
}
