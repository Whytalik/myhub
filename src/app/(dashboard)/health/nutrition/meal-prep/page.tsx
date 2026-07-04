import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/display/page-header";
import { MealPrep } from "@/features/health/nutrition/components/MealPrep";

export const metadata: Metadata = {
  title: "Nutrition — Meal Prep",
};

export default function NutritionMealPrepPage() {
  return (
    <div >
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "nutrition", href: "/health/nutrition" },
          { label: "meal prep" },
        ]}
        title="Meal Prep"
      />
      <div >
        <MealPrep />
      </div>
    </div>
  );
}
