import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/display/page-header";
import { Profiles } from "@/features/health/nutrition/components/Profiles";
import { FatSecretLinkCard } from "@/features/health/nutrition/components/FatSecretLinkCard";

export const metadata: Metadata = {
  title: "Nutrition — Profiles",
};

export default async function NutritionProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ fatsecret?: string; profile?: string }>;
}) {
  const { fatsecret, profile } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "nutrition", href: "/health/nutrition" },
          { label: "profiles" },
        ]}
        title="Profiles"
        description="Науковий розрахунок BMR/TDEE та цільових макросів на основі обезжиреної маси."
      />
      <FatSecretLinkCard
        banner={fatsecret && profile ? { status: fatsecret, profile } : undefined}
      />
      <Profiles />
    </div>
  );
}
