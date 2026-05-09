import React from "react";
import { VISUAL_PLAN_PREP } from "../../constants/visual-plan-data";

export const MealPrepList = () => {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] mb-4 flex items-center gap-2">
        <span className="text-base">🥘</span> Недільний Meal Prep (~60 хв)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {VISUAL_PLAN_PREP.map((item, idx) => (
          <div key={idx} className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-4 flex gap-4 items-start">
            <div className="text-base shrink-0">{item.icon}</div>
            <div>
              <div className="font-semibold text-[#e8eaf0] leading-tight mb-1">{item.name}</div>
              <div className="text-xs text-[#7b80a0] mb-1">{item.detail}</div>
              <div className="text-xs text-[#43d98c]">{item.use}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
