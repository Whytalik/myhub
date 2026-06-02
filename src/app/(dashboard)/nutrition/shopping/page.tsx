import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
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
      <div className="px-8 py-8">
        <PageHeader
          breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]}
          title="Shopping Cart"
          description="Create a plan first to generate a shopping cart."
        />
      </div>
    );
    }

    const weekPlanId = latestPlanResult.data.id;

    await generateShoppingCart(weekPlanId);

    const cartResult = await getShoppingCart(weekPlanId);
    if (!cartResult.success || !cartResult.data) {
      return (
        <div className="px-8 py-8">
          <PageHeader
            breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]}
            title="Shopping Cart"
            description="No shopping cart found for this week plan."
          />
        </div>
      );
    }

    const cartData = cartResult.data;
    const itemsByCategory = cartData.itemsByCategory;

    return (
      <div className="px-8 py-8">
        <PageHeader
          breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]}
          title="Shopping Cart"
          description="Aggregated ingredients for the current plan."
        />
        <div className="mt-6">
          <ShoppingCartView
            weekPlanId={weekPlanId}
            itemsByCategory={itemsByCategory}
            totalCost={cartData.totalCost}
            varietyWarnings={cartData.varietyWarnings}
          />
        </div>
      </div>
    );
    }
