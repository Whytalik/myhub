import type { Metadata } from "next";
import { DailyGoals } from "@/features/nutrition/components/visual-plan/DailyGoals";
import { DayCriteria } from "@/features/nutrition/components/visual-plan/DayCriteria";
import { WeeklySchedule } from "@/features/nutrition/components/visual-plan/WeeklySchedule";
import { SaucesAndMarinades } from "@/features/nutrition/components/visual-plan/SaucesAndMarinades";
import { RecipesSection } from "@/features/nutrition/components/visual-plan/RecipesSection";
import { ShoppingList } from "@/features/nutrition/components/visual-plan/ShoppingList";

export const metadata: Metadata = {
  title: "Visual Plan",
};

export default function VisualPlanPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-heading text-text leading-none tracking-tight">Visual Plan</h1>
          <p className="text-caption font-mono text-muted tracking-widest pl-1 italic">
            Weekly overview · Daily cooking targets
          </p>
        </div>
      </div>

      <div className="space-y-12 animate-in fade-in duration-500">
        <DailyGoals />
        <DayCriteria />
        <WeeklySchedule />
        <RecipesSection />
        <SaucesAndMarinades />
        <ShoppingList />
      </div>
    </div>
  );
}
