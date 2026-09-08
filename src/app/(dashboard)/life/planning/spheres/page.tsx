import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { SphereGrid } from "@/features/life/components/tasks/SphereGrid";
import * as sphereService from "@/features/life/services/sphere-service";

export const metadata: Metadata = { title: "Spheres" };

export default async function SpheresPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const spheres = await sphereService.getAllSpheres(userId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning" },
          { label: "spheres" },
        ]}
        title="Spheres"
        description="Life areas shared by Tasks and Thoughts — Health, Work, Finance, and the rest of your wheel of life."
      />
      <SphereGrid spheres={spheres} />
    </div>
  );
}
