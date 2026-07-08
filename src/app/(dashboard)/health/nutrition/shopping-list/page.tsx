import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { ShoppingList } from "@/features/health/nutrition/components/ShoppingList";
import { SpendSummary } from "@/features/health/nutrition/components/SpendSummary";
import {
  getGiftedForWeek,
  getActualSpendForWeek,
  getSpendHistory,
} from "@/features/health/nutrition/services/spending-service";
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
  const [gifted, currentSpend, history] = await Promise.all([
    getGiftedForWeek(weekStart),
    getActualSpendForWeek(weekStart, seasonOverride),
    getSpendHistory(seasonOverride),
  ]);

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
      <SpendSummary current={currentSpend} history={history} />
      <ShoppingList
        weekStart={weekStart}
        seasonOverride={seasonOverride}
        gifted={gifted.map((g) => ({
          itemId: g.itemId,
          productKey: g.productKey,
          value: g.value,
          quantityNote: g.quantityNote,
          note: g.note,
        }))}
      />
    </div>
  );
}
