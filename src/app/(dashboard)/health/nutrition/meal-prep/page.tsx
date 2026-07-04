import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { NutritionSpaceTabs } from "@/features/health/nutrition/components/NutritionSpaceTabs";
import { MealPrep } from "@/features/health/nutrition/components/MealPrep";

export const metadata: Metadata = {
  title: "Nutrition — Meal Prep",
};

export default function NutritionMealPrepPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "nutrition", href: "/health/nutrition" },
          { label: "meal prep" },
        ]}
        title="Meal Prep"
      />
      <div className="flex flex-col gap-6">
        <NutritionSpaceTabs />
        <MealPrep />
      </div>
    </div>
  );
}
