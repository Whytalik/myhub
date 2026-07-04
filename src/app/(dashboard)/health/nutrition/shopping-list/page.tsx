import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { NutritionSpaceTabs } from "@/features/health/nutrition/components/NutritionSpaceTabs";
import { ShoppingList } from "@/features/health/nutrition/components/ShoppingList";

export const metadata: Metadata = {
  title: "Nutrition — Shopping List",
};

export default function NutritionShoppingListPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "nutrition", href: "/health/nutrition" },
          { label: "shopping list" },
        ]}
        title="Shopping List"
      />
      <div className="flex flex-col gap-6">
        <NutritionSpaceTabs />
        <ShoppingList />
      </div>
    </div>
  );
}
