import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { MealPrep } from "@/features/health/nutrition/components/MealPrep";

export const metadata: Metadata = {
  title: "Nutrition — Meal Prep",
};

export default async function NutritionMealPrepPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "health space", href: "/health" },
          { label: "nutrition", href: "/health/nutrition" },
          { label: "meal prep" },
        ]}
        title="Meal Prep"
      />
      <MealPrep />
    </div>
  );
}
