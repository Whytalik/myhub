import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { getWeekPlans } from "@/features/nutrition/actions/planning";
import { getPersons } from "@/features/nutrition/actions/persons";
import { CreatePlanForm } from "@/features/nutrition/components/planner/CreatePlanForm";

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
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "plans" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <Heading title="Plans" />
          <p className="text-caption font-mono text-muted tracking-widest pl-1 italic">
            Weekly meal planning overview.
          </p>
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        <CreatePlanForm persons={persons} />

        {weekPlans.length === 0 ? (
          <p className="text-muted">No week plans yet. Create one above.</p>
        ) : (
          <div className="grid gap-4">
            {weekPlans.map((plan) => (
              <a
                key={plan.id}
                href={`/nutrition/week`}
                className="block bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
              >
                <h3 className="font-semibold">{plan.name || "Week Plan"}</h3>
                <p className="text-sm text-muted">{plan.startDate.toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
