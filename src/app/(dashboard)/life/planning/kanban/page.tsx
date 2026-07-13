import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { getSprintDashboard } from "@/features/life/services/sprint-service";
import { getAllSpheres } from "@/features/life/services/task-service";
import { KanbanBoardClient } from "@/features/life/components/sprints/KanbanBoardClient";

export const metadata: Metadata = {
  title: "Кайдзен-Канбан",
};

export default async function KanbanPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const [dashboardData, spheres] = await Promise.all([
    getSprintDashboard(userId),
    getAllSpheres(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning", href: "/life/planning" },
          { label: "kanban" },
        ]}
        title="Кайдзен-Канбан"
        description="Дворівневе планування 12-тижневих спринтів та щоденних атомів."
      />
      <KanbanBoardClient
        initialSprint={dashboardData.sprint as any}
        initialBacklogProjects={dashboardData.backlogProjects as any}
        initialColumns={dashboardData.columns as any}
        spheres={spheres}
      />
    </div>
  );
}
