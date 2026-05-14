import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { getLatestWeekPlan } from "@/features/nutrition/actions/planning"
import { getShoppingCart, generateShoppingCart } from "@/features/nutrition/actions/shopping"
import { ShoppingCartView } from "@/features/nutrition/components/planner/ShoppingCartView"

export const metadata: Metadata = {
  title: "Shopping",
};

export default async function ShoppingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const latestPlanResult = await getLatestWeekPlan();
  if (!latestPlanResult.success || !latestPlanResult.data) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]} />
          <Heading title="Shopping Cart" />
          <div className="h-px w-full bg-border-dim mt-4 mb-3" />
          <p className="text-body text-text-secondary mt-4">Create a week plan first to generate a shopping cart.</p>
        </div>
      </div>
    );
  }

  const weekPlanId = latestPlanResult.data.id;

  await generateShoppingCart(weekPlanId);

  const cartResult = await getShoppingCart(weekPlanId);
  if (!cartResult.success || !cartResult.data) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]} />
          <Heading title="Shopping Cart" />
          <div className="h-px w-full bg-border-dim mt-4 mb-3" />
          <p className="text-body text-text-secondary mt-4">No shopping cart found for this week plan.</p>
        </div>
      </div>
    );
  }

  const cartData = cartResult.data;
  const itemsByCategory = cartData.itemsByCategory;

  return (
    <div className="w-full">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]} />
        <Heading title="Shopping Cart" />
        <div className="h-px w-full bg-border-dim mt-4 mb-3" />
        <p className="text-body text-text-secondary">Aggregated ingredients for the week.</p>
      </div>
      <div className="mt-6">
        <ShoppingCartView
          weekPlanId={weekPlanId}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          itemsByCategory={itemsByCategory as any}
          totalCost={cartData.totalCost}
          personCosts={cartData.personCosts}
          varietyWarnings={cartData.varietyWarnings}
        />
      </div>
    </div>
  );
}
