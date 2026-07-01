import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { NutritionPageClient } from "@/features/health/nutrition/components/NutritionPageClient";

export const metadata: Metadata = {
  title: "Nutrition",
};

export default function NutritionPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "nutrition" }]}
        title="Nutrition"
        description="Track meals, macros, and eating patterns to fuel your body optimally."
      />
      <NutritionPageClient />
    </div>
  );
}
