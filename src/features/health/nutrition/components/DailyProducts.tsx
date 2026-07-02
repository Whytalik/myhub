import { DayPlan } from "../types";
import { Apple } from "lucide-react";

export function DailyProducts({ day }: { day: DayPlan }) {
  const dayIngredients = day.meals
    .flatMap((m) => m.ingredients)
    .filter((ing) => {
      const lower = ing.toLowerCase();
      return !lower.includes("друга порція") && !lower.includes("обідньої страви");
    });

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <Apple size={16} />
        </div>
        <div>
          <h3 className="text-note font-semibold text-text-primary">Продукти на {day.labelUk.toLowerCase()}</h3>
          <p className="text-caption text-text-muted">Агрегований список усіх необхідних продуктів на обраний день</p>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {dayIngredients.length > 0 ? (
        <ul className="flex flex-col gap-2 pl-1">
          {dayIngredients.map((ingredient, i) => (
            <li key={i} className="text-caption text-text-secondary leading-relaxed flex gap-2">
              <span className="text-accent shrink-0 font-bold font-mono">·</span>
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-caption text-text-muted py-2">Немає продуктів для відображення.</p>
      )}
    </div>
  );
}
