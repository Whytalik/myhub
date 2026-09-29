import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import * as thoughtService from "@/features/life/services/thought-service";
import * as sphereService from "@/features/life/services/sphere-service";
import * as missionService from "@/features/life/services/mission-service";
import * as sphereGoalService from "@/features/life/services/sphere-goal-service";
import * as yearFocusService from "@/features/life/services/year-focus-service";
import {
  getPendingSprintClosure,
  getSprintDashboard,
} from "@/features/life/services/sprint-service";
import { PlanningWizardClient } from "@/features/life/components/planning/PlanningWizardClient";
import { getDailyResistanceBudget } from "@/lib/actions/user-settings-actions";

type PlanningWizardClientProps = React.ComponentProps<typeof PlanningWizardClient>;

export const metadata: Metadata = {
  title: "Planning Wizard",
};

export default async function PlanningWizardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const [
    thoughts,
    spheres,
    dashboard,
    mission,
    dailyResistanceBudget,
    pendingClosure,
    focus,
    sphereGoals,
  ] = await Promise.all([
    thoughtService.getThoughtsForWizard(userId),
    sphereService.getAllSpheres(userId),
    getSprintDashboard(userId),
    missionService.getCurrentMission(userId),
    getDailyResistanceBudget(),
    getPendingSprintClosure(userId),
    yearFocusService.getFocus(userId, new Date().getFullYear()),
    sphereGoalService.getGoalsForYear(userId, new Date().getFullYear()),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning", href: "/life/planning" },
          { label: "wizard" },
        ]}
        title="Planning Wizard"
        description="Guided Flow: Brain Dump → Prime Filter → Decomposition → Kanban."
      />
      {pendingClosure && (
        <Link
          href="/life/sprint"
          className="glass-card p-4 border-amber-500/20 bg-amber-500/[0.03] text-xs text-amber-400 hover:bg-amber-500/[0.06] transition-colors duration-150"
        >
          Sprint {pendingClosure.sprint.number} · {pendingClosure.sprint.year} has ended. Close it
          before planning the next one →
        </Link>
      )}
      <PlanningWizardClient
        initialThoughts={thoughts as unknown as PlanningWizardClientProps["initialThoughts"]}
        spheres={spheres}
        activeSprint={dashboard.sprint as unknown as PlanningWizardClientProps["activeSprint"]}
        initialBacklogProjects={
          dashboard.backlogProjects as unknown as PlanningWizardClientProps["initialBacklogProjects"]
        }
        initialColumns={dashboard.columns as unknown as PlanningWizardClientProps["initialColumns"]}
        initialStandaloneAtoms={
          dashboard.standaloneAtoms as unknown as PlanningWizardClientProps["initialStandaloneAtoms"]
        }
        dailyResistanceBudget={dailyResistanceBudget}
        missionContent={mission?.content ?? null}
        focusSphereId={focus?.sphereId ?? null}
        sphereGoals={sphereGoals}
      />
    </div>
  );
}
