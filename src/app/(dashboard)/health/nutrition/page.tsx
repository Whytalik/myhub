import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/display/page-header";
import { NutritionPageClient } from "@/features/health/nutrition/components/NutritionPageClient";
import { FatSecretLinkCard } from "@/features/health/nutrition/components/FatSecretLinkCard";

export const metadata: Metadata = {
  title: "Nutrition — Daily",
};

export default async function NutritionDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ fatsecret?: string; profile?: string }>;
}) {
  const { fatsecret, profile } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "nutrition" }]}
        title="Nutrition"
      />
      <FatSecretLinkCard
        banner={fatsecret && profile ? { status: fatsecret, profile } : undefined}
      />
      <NutritionPageClient />
    </div>
  );
}
