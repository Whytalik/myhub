import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { getSprintDashboard } from "@/features/life/services/sprint-service";
import { SprintKanbanClient } from "@/features/life/components/sprints/SprintKanbanClient";

export const metadata: Metadata = {
  title: "Sprint Dashboard",
};

export default async function SprintKanbanPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const dashboard = await getSprintDashboard(userId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning", href: "/life/planning" },
          { label: "sprint dashboard" },
        ]}
        title="Sprint Dashboard"
        description="Аналізуйте прогрес цілей, оцінюйте тижні (W1–W12) та координуйте тактичні плани."
      />
      <SprintKanbanClient
        sprint={dashboard.sprint as any}
        backlogProjects={dashboard.backlogProjects as any}
        standaloneAtoms={dashboard.standaloneAtoms as any}
        allTasks={dashboard.allTasks as any}
        sprintReviews={dashboard.sprintReviews as any}
      />
    </div>
  );
}
