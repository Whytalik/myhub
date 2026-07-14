import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { getProjectDetail, getSprintDashboard } from "@/features/life/services/sprint-service";
import { getAllSpheres } from "@/features/life/services/task-service";
import { ProjectDetailClient } from "@/features/life/components/sprints/ProjectDetailClient";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const session = await auth();
  const userId = session?.user?.id;
  const { id } = await params;
  if (!userId) return { title: "Project" };

  const project = await getProjectDetail(userId, id);
  return { title: project ? project.title : "Project not found" };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const { id } = await params;

  const [project, dashboardData, spheres] = await Promise.all([
    getProjectDetail(userId, id),
    getSprintDashboard(userId),
    getAllSpheres(userId),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning", href: "/life/planning" },
          { label: "kanban", href: "/life/planning/kanban" },
          { label: project.title },
        ]}
        title={project.title}
      />
      <ProjectDetailClient
        initialProject={project as unknown as Parameters<typeof ProjectDetailClient>[0]["initialProject"]}
        objectives={dashboardData.sprint.objectives.map((o) => ({
          id: o.id,
          title: o.title,
          sphere: o.sphere,
        }))}
        spheres={spheres}
      />
    </div>
  );
}
