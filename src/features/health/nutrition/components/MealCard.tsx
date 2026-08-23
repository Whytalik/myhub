import { Coffee, Soup, UtensilsCrossed, Apple } from "lucide-react";
import type { Meal, MealType } from "../types";
import { calculateMealMacros, type MacroOverrides } from "../nutrition-calc";

const MEAL_ICON: Record<MealType, typeof Coffee> = {
  breakfast: Coffee,
  lunch: Soup,
  dinner: UtensilsCrossed,
  snack: Apple,
};

export function MealCard({ meal, overrides }: { meal: Meal; overrides?: MacroOverrides }) {
  const Icon = MEAL_ICON[meal.type];
  const vitaliiMacros = calculateMealMacros(meal, "vitalii", overrides);
  const olesiaMacros = calculateMealMacros(meal, "olesia", overrides);

  const hasMacros = vitaliiMacros.kcal > 0 || olesiaMacros.kcal > 0;

  return (
    <div className="glass-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-nutrition/10 text-accent-nutrition shrink-0">
          <Icon size={14} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-label">{meal.label}</span>
          <span className="text-sm text-zinc-200 truncate">{meal.title}</span>
        </div>
      </div>

      {hasMacros && (
        <div className="flex flex-col gap-1 text-[11px] border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-2 sm:pt-0 sm:pl-3 shrink-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-zinc-500 font-semibold inline-block w-4 shrink-0">В:</span>
            <span className="font-mono text-zinc-300 inline-block w-[80px] text-right shrink-0">
              {vitaliiMacros.kcal} <span className="text-zinc-500 font-normal">ккал</span>
            </span>
            <span className="text-zinc-500 font-mono flex items-center gap-1.5 shrink-0">
              <span>·</span>
              <span>
                Б <span className="text-zinc-100">{vitaliiMacros.protein}г</span>
              </span>
              <span>·</span>
              <span>
                Ж <span className="text-zinc-100">{vitaliiMacros.fat}г</span>
              </span>
              <span>·</span>
              <span>
                В <span className="text-zinc-100">{vitaliiMacros.carbs}г</span>
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-zinc-500 font-semibold inline-block w-4 shrink-0">О:</span>
            <span className="font-mono text-zinc-300 inline-block w-[80px] text-right shrink-0">
              {olesiaMacros.kcal} <span className="text-zinc-500 font-normal">ккал</span>
            </span>
            <span className="text-zinc-500 font-mono flex items-center gap-1.5 shrink-0">
              <span>·</span>
              <span>
                Б <span className="text-zinc-100">{olesiaMacros.protein}г</span>
              </span>
              <span>·</span>
              <span>
                Ж <span className="text-zinc-100">{olesiaMacros.fat}г</span>
              </span>
              <span>·</span>
              <span>
                В <span className="text-zinc-100">{olesiaMacros.carbs}г</span>
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
