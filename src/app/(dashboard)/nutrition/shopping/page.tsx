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
      <div className="px-6 md:px-14 py-8 md:py-10">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]} />
        <Heading title="Shopping Cart" />
        <p className="text-muted mt-4">Create a week plan first to generate a shopping cart.</p>
      </div>
    );
  }

  const weekPlanId = latestPlanResult.data.id;

  // Auto-generate cart if it doesn't exist
  await generateShoppingCart(weekPlanId);

  const cartResult = await getShoppingCart(weekPlanId);
  if (!cartResult.success || !cartResult.data) {
    return (
      <div className="px-6 md:px-14 py-8 md:py-10">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]} />
        <Heading title="Shopping Cart" />
        <p className="text-muted mt-4">No shopping cart found for this week plan.</p>
      </div>
    );
  }

  const cartData = cartResult.data;
  const itemsByCategory = cartData.itemsByCategory;

  interface CartViewItem {
    id: string; productId: string; requiredRawGrams: number; availableGrams: number | null;
    packagesCount: number | null; totalCost: number | null; status: string;
    product: { name: string; price: number | null; packageWeight: number | null; pantryStock: null; category: string | null };
    dishes: { dishName: string; dishId: string }[];
  }

  const groupedByCategory: Record<string, CartViewItem[]> = {};
  for (const [category, catItems] of Object.entries(itemsByCategory)) {
    groupedByCategory[category] = (catItems as Array<{
      id: string; productId: string; requiredRawGrams: number; availableGrams: number | null;
      packagesCount: number | null; totalCost: number | null; status: string;
      product: { name: string; price: number | null; standardPackageAmount: number | null; category: string | null };
    }>).map((item) => ({
      id: item.id,
      productId: item.productId,
      requiredRawGrams: item.requiredRawGrams,
      availableGrams: item.availableGrams,
      packagesCount: item.packagesCount,
      totalCost: item.totalCost,
      status: item.status,
      product: {
        name: item.product.name,
        price: item.product.price,
        packageWeight: item.product.standardPackageAmount,
        pantryStock: null,
        category: item.product.category,
      },
      dishes: [] as { dishName: string; dishId: string }[],
    }));
  }

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "shopping" }]} />
      <Heading title="Shopping Cart" />
      <div className="mt-6">
        <ShoppingCartView
          weekPlanId={weekPlanId}
          itemsByCategory={groupedByCategory}
          totalCost={cartData.totalCost}
          personCosts={cartData.personCosts}
          varietyWarnings={cartData.varietyWarnings}
        />
      </div>
    </div>
  );
}
