import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/display/page-header";
import { ShoppingList } from "@/features/health/nutrition/components/ShoppingList";

export const metadata: Metadata = {
  title: "Nutrition — Shopping List",
};

export default function NutritionShoppingListPage() {
  return (
    <div >
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "nutrition", href: "/health/nutrition" },
          { label: "shopping list" },
        ]}
        title="Shopping List"
      />
      <div >
        <ShoppingList />
      </div>
    </div>
  );
}
