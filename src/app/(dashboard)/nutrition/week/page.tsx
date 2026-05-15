import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { getWeekPlan, getLatestWeekPlan, getWeekSummary } from "@/features/nutrition/actions/planning"
import { getDishesForPicker } from "@/features/nutrition/actions/dishes"
import { getProducts } from "@/features/nutrition/actions/products"
import { WeekPlanner } from "@/features/nutrition/components/planner/WeekPlanner"
import { WeekSummary } from "@/features/nutrition/components/planner/WeekSummary"

interface WeekPageProps {
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ searchParams }: WeekPageProps): Promise<Metadata> {
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
        title: weekPlanResult.data.name || "Week Plan",
      };
    }
  }

  return {
    title: "Week Plan",
  };
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
      <div className="px-8 py-8">
        <PageHeader
          breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "plans", href: "/nutrition/plans" }, { label: "week" }]}
          title="Week Plan"
          description="No week plans found. Create one from the Plans page."
        />
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
          breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "plans", href: "/nutrition/plans" }, { label: "week" }]}
          title="Week Plan"
          description="Failed to load week plan."
        />
      </div>
    );
  }

  const planName = weekPlan.name || "Week Plan";

  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "plans", href: "/nutrition/plans" }, { label: planName }]}
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
