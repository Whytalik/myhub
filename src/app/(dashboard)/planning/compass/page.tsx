import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
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
      <Breadcrumb items={[
        { label: "planning space", href: "/planning" },
        { label: "annual compass" }
      ]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Annual Compass" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Level 03: The strategic flavor and non-negotiable goals for the current year.
        </p>
      </div>

      <AnnualCompassView initialData={compass} />
    </div>
  );
}
