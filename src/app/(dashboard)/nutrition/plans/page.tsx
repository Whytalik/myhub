import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { getWeekPlans } from "@/features/nutrition/actions/planning";
import { getPersons } from "@/features/nutrition/actions/persons";
import { CreatePlanForm } from "@/features/nutrition/components/planner/CreatePlanForm";
import { PlanList } from "@/features/nutrition/components/planner/PlanList";

export const metadata: Metadata = {
  title: "Plans",
};

export default async function PlansPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const weekPlansResult = await getWeekPlans();
  const weekPlans = weekPlansResult.success ? weekPlansResult.data : [];

  const personsResult = await getPersons();
  const persons = personsResult.success ? personsResult.data : [];

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "plans" }]}
        title="Plans"
        description="Weekly meal planning overview."
      />

      <CreatePlanForm persons={persons} />
      <div className="mt-8 animate-in fade-in duration-500">
        <PlanList initialPlans={weekPlans} />
      </div>
    </div>
  );
}
