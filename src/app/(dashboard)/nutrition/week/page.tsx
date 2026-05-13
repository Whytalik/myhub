import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { getWeekPlan, getLatestWeekPlan, getWeekSummary } from "@/features/nutrition/actions/planning"
import { getDishesForPicker } from "@/features/nutrition/actions/dishes"
import { getProducts } from "@/features/nutrition/actions/products"
import { WeekPlanner } from "@/features/nutrition/components/planner/WeekPlanner"
import { WeekSummary } from "@/features/nutrition/components/planner/WeekSummary"

export const metadata: Metadata = {
  title: "Week Plan",
};

interface WeekPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function WeekPage({ searchParams }: WeekPageProps) {
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
    return (
      <div className="w-full">
        <div className="mb-8">
          <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "week" }]} />
          <Heading title="Week Plan" />
          <div className="h-px w-full bg-border-dim mt-4 mb-3" />
          <p className="text-body text-text-secondary mt-4">No week plans found. Create one from the Plans page.</p>
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
      <div className="w-full">
        <div className="mb-8">
          <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "week" }]} />
          <Heading title="Week Plan" />
          <div className="h-px w-full bg-border-dim mt-4 mb-3" />
          <p className="text-body text-text-secondary mt-4">Failed to load week plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "week" }]} />
        <Heading title="Week Plan" />
        <div className="h-px w-full bg-border-dim mt-4 mb-3" />
        <p className="text-body text-text-secondary">Weekly meal schedule and nutrition tracking.</p>
      </div>
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
