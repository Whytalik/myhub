import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { ShoppingList } from "@/features/health/nutrition/components/ShoppingList";
import { currentWeekStart, weekStartKey } from "@/features/health/nutrition/week";

export const metadata: Metadata = {
  title: "Nutrition — Shopping List",
};

export default async function NutritionShoppingListPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const seasonOverride = cookieStore.get("nutrition-menu-season")?.value;

  const weekStart = weekStartKey(currentWeekStart());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "nutrition", href: "/health/nutrition" },
          { label: "shopping list" },
        ]}
        title="Shopping List"
      />
      <ShoppingList weekStart={weekStart} seasonOverride={seasonOverride} />
    </div>
  );
}
