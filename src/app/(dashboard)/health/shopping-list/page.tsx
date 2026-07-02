import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ShoppingList } from "@/features/health/nutrition/components/ShoppingList";

export const metadata: Metadata = {
  title: "Shopping List",
};

export default function ShoppingListPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "shopping list" }]}
        title="Shopping List"
        description="Weekly consolidated grocery list for Olesia and Vitalii."
      />
      <ShoppingList />
    </div>
  );
}
