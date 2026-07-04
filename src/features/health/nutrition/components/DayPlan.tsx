"use client";

import { PROFILES } from "../data";
import { calculateDayMacros } from "../nutrition-calc";
import { MealCard } from "./MealCard";
import type { DayPlan as DayPlanType } from "../types";
export function DayPlan({ day }: { day: DayPlanType }) {
  const actual = {
    vitalii: calculateDayMacros(day, "vitalii"),
    olesia: calculateDayMacros(day, "olesia"),
  };

  const dayIngredients = day.meals
    .flatMap((m) => m.ingredients)
    .filter((ing) => {
      const lower = ing.toLowerCase();
      return !lower.includes("друга порція") && !lower.includes("обідньої страви");
    });

  return (
    <div >
      {}
      <div >
        {PROFILES.map((profile) => {
          const macros = actual[profile.id as keyof typeof actual];
          return (
            <div
              key={profile.id}

            >
              <span >{profile.name}</span>
              <span >{macros.kcal} ккал/день</span>
              <span >·</span>
              <span>Б {macros.protein} г</span>
              <span >·</span>
              <span>Ж {macros.fat} г</span>
              <span >·</span>
              <span>В {macros.carbs} г</span>
              <span >(ціль {profile.kcal} ккал)</span>
            </div>
          );
        })}
      </div>

      {day.note && (
        <p >
          {day.note}
        </p>
      )}

      {}
      <div >
        {day.meals.map((meal) => (
          <MealCard key={meal.type} meal={meal} />
        ))}
      </div>

      {}
      {dayIngredients.length > 0 && (
        <div >
          <span >
            Продукти на день
          </span>
          <ul >
            {dayIngredients.map((ingredient, i) => (
              <li key={i} >
                <span >·</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {}
      {day.prepSteps && day.prepSteps.length > 0 && (
        <div >
          <span >
            Алгоритм приготування
          </span>
          <div >
            {day.prepSteps.map((section, idx) => (
              <div key={idx} >
                <span >{section.title}</span>
                <ul >
                  {section.steps.map((step, stepIdx) => (
                    <li
                      key={stepIdx}

                    >
                      <span >
                        {stepIdx + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
