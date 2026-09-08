import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { MissionPageClient } from "@/features/life/components/mission/MissionPageClient";
import * as missionService from "@/features/life/services/mission-service";
import * as sphereService from "@/features/life/services/sphere-service";
import * as directionService from "@/features/life/services/direction-service";

export const metadata: Metadata = { title: "Mission" };

export default async function MissionPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const [mission, spheres, directions] = await Promise.all([
    missionService.getCurrentMission(userId),
    sphereService.getAllSpheres(userId),
    directionService.getAllDirections(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning" },
          { label: "mission" },
        ]}
        title="Mission"
        description="Your personal constitution — begin with the end in mind."
      />
      <MissionPageClient
        currentContent={mission?.content ?? ""}
        spheres={spheres}
        directions={directions}
      />
    </div>
  );
}
