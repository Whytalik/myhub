import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { getWeekPlan, getLatestWeekPlan, getWeekSummary } from "@/features/nutrition/actions/planning";
import { getDishesForPicker } from "@/features/nutrition/actions/dishes";
import { getProducts } from "@/features/nutrition/actions/products";
import { getPersons } from "@/features/nutrition/actions/persons";
import { WeekPlanner } from "@/features/nutrition/components/planner/WeekPlanner";
import { WeekSummary } from "@/features/nutrition/components/planner/WeekSummary";
import { CreatePlanForm } from "@/features/nutrition/components/planner/CreatePlanForm";

interface PlanPageProps {
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ searchParams }: PlanPageProps): Promise<Metadata> {
  const { id: planId } = await searchParams;
  let activePlanId = planId;

  if (!activePlanId) {
    const latestPlanResult = await getLatestWeekPlan();
    if (latestPlanResult.success && latestPlanResult.data) {
      activePlanId = latestPlanResult.data.id;
    }
  }

  if (activePlanId) {
    const weekPlanResult = await getWeekPlan(activePlanId);
    if (weekPlanResult.success && weekPlanResult.data) {
      return {
        title: weekPlanResult.data.name || "Plan",
      };
    }
  }

  return {
    title: "Plan",
  };
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: planId } = await searchParams;
  let activePlanId = planId;

  if (!activePlanId) {
    const latestPlanResult = await getLatestWeekPlan();
    if (latestPlanResult.success && latestPlanResult.data) {
      activePlanId = latestPlanResult.data.id;
    }
  }

  if (!activePlanId) {
    const personsResult = await getPersons();
    const persons = personsResult.success ? personsResult.data : [];

    return (
      <div className="px-8 py-8">
        <PageHeader
          breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "plan" }]}
          title="Plan"
          description="Create a plan to start nutrition tracking."
        />
        <div className="mt-8">
          <CreatePlanForm persons={persons} />
        </div>
      </div>
    );
  }

  const [weekPlanResult, dishesResult, productsResult, summaryResult] = await Promise.all([
    getWeekPlan(activePlanId),
    getDishesForPicker(),
    getProducts(),
    getWeekSummary(activePlanId),
  ]);

  const weekPlan = weekPlanResult.success ? weekPlanResult.data : null;
  const dishes = dishesResult.success ? dishesResult.data : [];
  const products = productsResult.success ? productsResult.data : [];
  const summary = summaryResult.success ? summaryResult.data : null;

  if (!weekPlan) {
    return (
      <div className="px-8 py-8">
        <PageHeader
          breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "plan" }]}
          title="Plan"
          description="Failed to load plan."
        />
      </div>
    );
  }

  const planName = weekPlan.name || "Plan";

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "plan" }]}
        title={planName}
        description="Weekly meal schedule and nutrition tracking."
      />
      {summary && (
        <div className="mb-6">
          <WeekSummary summary={summary} />
        </div>
      )}
      <div className="mt-6">
        <WeekPlanner weekPlan={weekPlan} dishes={dishes} products={products} />
      </div>
    </div>
  );
}
