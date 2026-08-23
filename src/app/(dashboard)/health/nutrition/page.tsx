import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { NutritionPageClient } from "@/features/health/nutrition/components/NutritionPageClient";
import { getMacroOverrides } from "@/features/health/nutrition/services/product-mapping-service";

export const metadata: Metadata = {
  title: "Nutrition — Daily",
};

export default async function NutritionDailyPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const seasonOverride = cookieStore.get("nutrition-menu-season")?.value;
  const macroOverrides = await getMacroOverrides();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "nutrition" }]}
        title="Nutrition"
      />
      <NutritionPageClient seasonOverride={seasonOverride} macroOverrides={macroOverrides} />
    </div>
  );
}
