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
    <div >
      <div >
        <div >
          <Icon size={14} />
        </div>
        <div >
          <span >
            {meal.label}
          </span>
          <span >{meal.title}</span>
        </div>
      </div>
    </div>
  );
}
