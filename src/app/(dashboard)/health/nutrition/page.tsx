import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { NutritionPageClient } from "@/features/health/nutrition/components/NutritionPageClient";

export const metadata: Metadata = {
  title: "Nutrition — Daily",
};

export default async function NutritionDailyPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "nutrition" }]}
        title="Nutrition"
      />
      <NutritionPageClient />
    </div>
  );
}
