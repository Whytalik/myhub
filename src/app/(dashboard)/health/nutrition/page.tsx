import type { Metadata } from "next";
import { Utensils } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Nutrition",
};

export default function NutritionPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "nutrition" }]}
        title="Nutrition"
        description="Track meals, macros, and eating patterns to fuel your body optimally."
      />
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Utensils size={28} className="text-accent opacity-60" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center max-w-sm">
          <p className="text-text-primary font-medium text-note">Coming soon</p>
          <p className="text-text-secondary text-subtitle leading-relaxed">
            Log meals, track macros, and monitor eating habits to stay on top of your nutrition goals.
          </p>
        </div>
      </div>
    </div>
  );
}
