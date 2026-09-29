import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { SprintKanbanClient } from "@/features/life/components/sprints/SprintKanbanClient";
import * as sprintService from "@/features/life/services/sprint-service";
import * as sphereService from "@/features/life/services/sphere-service";
import { SprintClosureDialog } from "@/features/life/components/sprints/SprintClosureDialog";

type SprintKanbanClientProps = React.ComponentProps<typeof SprintKanbanClient>;

export const metadata: Metadata = { title: "Sprint Dashboard" };

export default async function SprintPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const [dashboard, spheres, pendingClosure] = await Promise.all([
    sprintService.getSprintExecutionCenter(userId),
    sphereService.getAllSpheres(userId),
    sprintService.getPendingSprintClosure(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "sprint" }]}
        title="Sprint Dashboard"
        description="Analyze goal progress, evaluate weeks (W1-W12), and coordinate tactical plans."
      />
      {pendingClosure && <SprintClosureDialog closure={pendingClosure} />}
      <SprintKanbanClient
        sprint={dashboard.sprint as unknown as SprintKanbanClientProps["sprint"]}
        allTasks={dashboard.allTasks as unknown as SprintKanbanClientProps["allTasks"]}
        spheres={spheres}
        sprintReviews={
          dashboard.sprintReviews as unknown as SprintKanbanClientProps["sprintReviews"]
        }
      />
    </div>
  );
}
