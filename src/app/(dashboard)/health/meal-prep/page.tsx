import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MealPrep } from "@/features/health/nutrition/components/MealPrep";

export const metadata: Metadata = {
  title: "Meal Prep",
};

export default function MealPrepPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "meal prep" }]}
        title="Meal Prep"
        description="Prepare and organize protein portions for the upcoming week."
      />
      <MealPrep />
    </div>
  );
}
