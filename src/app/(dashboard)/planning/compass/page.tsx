import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { getAnnualCompassAction } from "@/features/operations/actions/sprint-actions";
import { AnnualCompassView } from "@/features/operations/components/AnnualCompassView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Annual Compass | Planning",
};

export default async function CompassPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const currentYear = new Date().getFullYear();
  const compass = await getAnnualCompassAction(currentYear);

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <PageHeader
        breadcrumb={[
          { label: "planning space", href: "/planning" },
          { label: "annual compass" }
        ]}
        title="Annual Compass"
        description="Level 03: The strategic flavor and non-negotiable goals for the current year."
      />

      <AnnualCompassView initialData={compass} />
    </div>
  );
}
