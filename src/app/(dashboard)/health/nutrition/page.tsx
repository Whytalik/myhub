import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { NutritionPageClient } from "@/features/health/nutrition/components/NutritionPageClient";

export const metadata: Metadata = {
  title: "Nutrition — Daily",
};

export default function NutritionDailyPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "nutrition" }]}
        title="Nutrition"
      />
      <div className="flex flex-col gap-6">
        <NutritionPageClient />
      </div>
    </div>
  );
}
