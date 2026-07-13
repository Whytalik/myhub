import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import * as thoughtService from "@/features/life/services/thought-service";
import * as taskService from "@/features/life/services/task-service";
import { getSprintDashboard } from "@/features/life/services/sprint-service";
import { PlanningWizardClient } from "@/features/life/components/planning/PlanningWizardClient";

export const metadata: Metadata = {
  title: "Planning Wizard",
};

export default async function PlanningWizardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const [thoughts, spheres, dashboard] = await Promise.all([
    thoughtService.getThoughtsForWizard(userId),
    taskService.getAllSpheres(userId),
    getSprintDashboard(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning", href: "/life/planning" },
          { label: "wizard" },
        ]}
        title="Kaizen Planning Flow"
        description="Guided Flow: Brain Dump → Prime Filter → Decomposition → Kanban."
      />
      <PlanningWizardClient
        initialThoughts={thoughts as any}
        spheres={spheres}
        activeSprint={dashboard.sprint as any}
        initialBacklogProjects={dashboard.backlogProjects as any}
        initialColumns={dashboard.columns as any}
      />
    </div>
  );
}
