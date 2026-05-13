import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
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
    <div className="w-full">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "plans" }]} />
        <Heading title="Plans" />
        <div className="h-px w-full bg-border-dim mt-4 mb-3" />
        <p className="text-body text-text-secondary">Weekly meal planning overview.</p>
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        <CreatePlanForm persons={persons} />
        <PlanList initialPlans={weekPlans} />
      </div>
    </div>
  );
}
