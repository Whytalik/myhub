import React from "react";
import { VISUAL_PLAN_DISHES } from "../../constants/visual-plan-data";

export const RecipesSection = () => {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] mb-4 flex items-center gap-2">
        <span className="text-base">📋</span> Рецепти страв
      </h2>
      <div className="text-[10px] text-[#7b80a0] mb-4 flex items-center gap-1">
        <span className="text-[#f7a948]">📋</span>
        <span>= страва у тижневому розкладі</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {VISUAL_PLAN_DISHES.map((dish) => (
          <div key={dish.id} className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#2e3147]">
              <span className="text-base">{dish.emoji}</span>
              <span className="font-bold text-body text-[#e8eaf0]">{dish.name}</span>
            </div>

            <div className="flex flex-col gap-1">
              {dish.ingredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between gap-2 text-xs">
                  <span className="text-[#c8cade]">{ing.name}</span>
                  {ing.amount && (
                    <span className="text-[#7b80a0] shrink-0">{ing.amount}</span>
                  )}
                </div>
              ))}
            </div>

            {dish.method && (
              <div className="pt-2 border-t border-[#2e3147]/60 text-xs text-[#7b80a0] leading-relaxed italic">
                {dish.method}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
