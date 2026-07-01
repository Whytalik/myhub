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
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent-muted text-accent flex items-center justify-center shrink-0">
          <Icon size={14} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-caption font-mono uppercase tracking-wider text-text-muted">
            {meal.label}
          </span>
          <span className="text-note font-medium text-text-primary truncate">{meal.title}</span>
        </div>
      </div>

      {meal.ingredients.length > 0 && (
        <ul className="flex flex-col gap-1 pl-1">
          {meal.ingredients.map((ingredient, i) => (
            <li key={i} className="text-caption text-text-secondary leading-relaxed flex gap-2">
              <span className="text-text-muted shrink-0">·</span>
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
