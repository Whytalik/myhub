import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { GoalsWall } from "@/features/life/components/goals/GoalsWall";
import * as sphereService from "@/features/life/services/sphere-service";
import * as sphereGoalService from "@/features/life/services/sphere-goal-service";
import * as missionService from "@/features/life/services/mission-service";
import * as sphereRoleService from "@/features/life/services/sphere-role-service";
import * as yearFocusService from "@/features/life/services/year-focus-service";

export const metadata: Metadata = { title: "Goals Wall" };

export default async function GoalsWallPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const year = new Date().getFullYear();
  const [spheres, goals, mission, focus] = await Promise.all([
    sphereService.getAllSpheres(userId),
    sphereGoalService.getGoalsForYear(userId, year),
    missionService.getCurrentMission(userId),
    yearFocusService.getFocus(userId, year),
  ]);

  const activeSpheres = spheres.filter((sphere) => sphere.isActive);
  const roles = await sphereRoleService.getRolesForYear(
    userId,
    year,
    activeSpheres.map((sphere) => sphere.id),
  );
  const workingSpheres = activeSpheres.filter((sphere) => {
    const role = roles.find((entry) => entry.sphereId === sphere.id)?.role;
    return role === "FOCUS" || role === "ACTIVE";
  });
  const minimums = roles.flatMap((entry) => {
    const sphere = activeSpheres.find((item) => item.id === entry.sphereId);
    return entry.role === "MINIMUM" && sphere && entry.plank
      ? [{ name: sphere.name, plank: entry.plank }]
      : [];
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning" },
          { label: "goals", href: "/life/planning/goals" },
          { label: "wall" },
        ]}
        title="Goals Wall"
        description="One page with every goal. Print it, hang it up, or run it fullscreen on a second screen."
      />
      <GoalsWall
        spheres={workingSpheres}
        minimums={minimums}
        goals={goals}
        year={year}
        mission={mission?.content ?? null}
        focus={focus}
      />
    </div>
  );
}
