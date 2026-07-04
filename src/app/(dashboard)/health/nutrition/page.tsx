import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { NutritionSpaceClient } from "@/features/health/nutrition/components/NutritionSpaceClient";

export const metadata: Metadata = {
  title: "Nutrition",
};

export default function NutritionPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "nutrition" }]}
        title="Nutrition"
      />
      <NutritionSpaceClient />
    </div>
  );
}
