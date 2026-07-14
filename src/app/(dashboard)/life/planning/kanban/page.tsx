import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import {
  getSprintDashboard,
  getStandaloneBacklogTasks,
} from "@/features/life/services/sprint-service";
import { getAllSpheres } from "@/features/life/services/task-service";
import { KanbanBoardClient } from "@/features/life/components/sprints/KanbanBoardClient";

export const metadata: Metadata = {
  title: "Kaizen Kanban",
};

export default async function KanbanPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const [dashboardData, spheres, standaloneTasks] = await Promise.all([
    getSprintDashboard(userId),
    getAllSpheres(userId),
    getStandaloneBacklogTasks(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning", href: "/life/planning" },
          { label: "kanban" },
        ]}
        title="Kaizen Kanban"
        description="Split-scale planning for 12-week sprints and daily task atoms."
      />
      <KanbanBoardClient
        initialSprint={dashboardData.sprint as any}
        initialBacklogProjects={dashboardData.backlogProjects as any}
        initialColumns={dashboardData.columns as any}
        initialAllTasks={dashboardData.allTasks as any}
        initialStandaloneTasks={standaloneTasks as any}
        spheres={spheres}
      />
    </div>
  );
}
