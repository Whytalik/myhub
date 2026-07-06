import { Coffee, Soup, UtensilsCrossed, Apple } from "lucide-react";
import type { Meal, MealType } from "../types";

const MEAL_ICON: Record<MealType, typeof Coffee> = {
  breakfast: Coffee,
  lunch: Soup,
  dinner: UtensilsCrossed,
  snack: Apple,
};

export function MealCard({ meal }: { meal: Meal }) {
  const Icon = MEAL_ICON[meal.type];

  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-nutrition/10 text-accent-nutrition shrink-0">
        <Icon size={14} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-label">{meal.label}</span>
        <span className="text-sm text-zinc-200 truncate">{meal.title}</span>
      </div>
    </div>
  );
}
