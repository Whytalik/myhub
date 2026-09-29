import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { SprintKanbanClient } from "@/features/life/components/sprints/SprintKanbanClient";
import * as sprintService from "@/features/life/services/sprint-service";
import * as sphereService from "@/features/life/services/sphere-service";
import * as yearFocusService from "@/features/life/services/year-focus-service";
import * as sphereGoalService from "@/features/life/services/sphere-goal-service";
import * as weeklyReviewService from "@/features/life/services/weekly-review-service";
import { ReviewDueBanner } from "@/features/life/components/review/ReviewDueBanner";
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

  const [sprintGoals, focus, reviewDue] = await Promise.all([
    sphereGoalService.getSprintGoalProgress(userId, dashboard.sprint),
    yearFocusService.getFocus(userId, dashboard.sprint.year),
    weeklyReviewService.getReviewDueState(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "sprint" }]}
        title="Sprint Dashboard"
        description="Analyze goal progress, evaluate weeks (W1-W12), and coordinate tactical plans."
      />
      {pendingClosure && <SprintClosureDialog closure={pendingClosure} />}
      {reviewDue.isDue && <ReviewDueBanner weekStart={reviewDue.weekStart} />}
      <SprintKanbanClient
        sprint={dashboard.sprint as unknown as SprintKanbanClientProps["sprint"]}
        allTasks={dashboard.allTasks as unknown as SprintKanbanClientProps["allTasks"]}
        spheres={spheres}
        sprintGoals={sprintGoals}
        focus={focus}
        sprintReviews={
          dashboard.sprintReviews as unknown as SprintKanbanClientProps["sprintReviews"]
        }
      />
    </div>
  );
}
