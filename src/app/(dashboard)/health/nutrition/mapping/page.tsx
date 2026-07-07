import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/display/page-header";
import { FoodMapperClient } from "@/features/health/nutrition/components/FoodMapperClient";
import { getMappingOverview } from "@/features/health/nutrition/services/product-mapping-service";

export const metadata: Metadata = {
  title: "Nutrition — Food Mapper",
};

export default async function NutritionMappingPage() {
  const overview = await getMappingOverview();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "nutrition", href: "/health/nutrition" },
          { label: "food mapper" },
        ]}
        title="Food Mapper"
      />
      <FoodMapperClient initialOverview={overview} />
    </div>
  );
}
