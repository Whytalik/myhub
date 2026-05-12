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

export default async function WeekPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const latestPlanResult = await getLatestWeekPlan();
  if (!latestPlanResult.success || !latestPlanResult.data) {
    return (
      <div className="px-6 md:px-14 py-8 md:py-10">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "week" }]} />
        <Heading title="Week Plan" />
        <p className="text-muted mt-4">No week plans found. Create one from the profiles page.</p>
      </div>
    );
  }

  const [weekPlanResult, dishesResult, productsResult, summaryResult] = await Promise.all([
    getWeekPlan(latestPlanResult.data.id),
    getDishesForPicker(),
    getProducts(),
    getWeekSummary(latestPlanResult.data.id),
  ]);

  const weekPlan = weekPlanResult.success ? weekPlanResult.data : null;
  const dishes = dishesResult.success ? dishesResult.data : [];
  const products = productsResult.success ? productsResult.data : [];
  const summary = summaryResult.success ? summaryResult.data : null;

  if (!weekPlan) {
    return (
      <div className="px-6 md:px-14 py-8 md:py-10">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "week" }]} />
        <Heading title="Week Plan" />
        <p className="text-muted mt-4">Failed to load week plan.</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "week" }]} />
      <Heading title="Week Plan" />
      <div className="mt-6">
        <WeekPlanner weekPlan={weekPlan} dishes={dishes} products={products} />
      </div>
      {summary && (
        <div className="mt-8">
          <WeekSummary summary={summary} />
        </div>
      )}
    </div>
  );
}
