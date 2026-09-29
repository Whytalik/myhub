import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { GoalsPageClient } from "@/features/life/components/goals/GoalsPageClient";
import * as sphereService from "@/features/life/services/sphere-service";
import * as sphereGoalService from "@/features/life/services/sphere-goal-service";
import * as goalPlaybookService from "@/features/life/services/goal-playbook-service";
import { SetupChecklist } from "@/features/life/components/goals/SetupChecklist";
import * as sphereRoleService from "@/features/life/services/sphere-role-service";
import * as yearFocusService from "@/features/life/services/year-focus-service";
import * as habitService from "@/features/life/services/habit-service";

export const metadata: Metadata = { title: "Life Goals" };

export default async function GoalsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const year = new Date().getFullYear();
  const [spheres, goals, habits, focus] = await Promise.all([
    sphereService.getAllSpheres(userId),
    sphereGoalService.getGoalsForYear(userId, year),
    habitService.getActiveHabits(userId),
    yearFocusService.getFocus(userId, year),
  ]);

  const activeSpheres = spheres.filter((sphere) => sphere.isActive);
  const roles = await sphereRoleService.getRolesForYear(
    userId,
    year,
    activeSpheres.map((sphere) => sphere.id),
  );
  const setupProgress = await goalPlaybookService.getSetupProgress(
    userId,
    goals.length,
    focus !== null,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning" },
          { label: "goals" },
        ]}
        title="Life Goals"
        description="3–5 measurable goals per life sphere. Numbers, not wishes."
      />
      <SetupChecklist progress={setupProgress} />
      <GoalsPageClient
        spheres={activeSpheres}
        goals={goals}
        habits={habits
          .filter((habit) => !habit.archived)
          .map((habit) => ({ id: habit.id, name: habit.name }))}
        year={year}
        focus={focus}
        roles={roles}
      />
    </div>
  );
}
