import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/display/page-header";
import { NutritionPageClient } from "@/features/health/nutrition/components/NutritionPageClient";

export const metadata: Metadata = {
  title: "Nutrition — Daily",
};

export default function NutritionDailyPage() {
  return (
    <div >
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "nutrition" }]}
        title="Nutrition"
      />
      <div >
        <NutritionPageClient />
      </div>
    </div>
  );
}
