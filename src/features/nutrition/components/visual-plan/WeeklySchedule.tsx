"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { VISUAL_PLAN_SCHEDULE } from "../../constants/visual-plan-data";

const MEAL_ORDER = ["Передтрен", "Сніданок", "Обід", "Перекус", "Вечеря"];

function getMealType(type: string): string {
  for (const key of MEAL_ORDER) {
    if (type.includes(key)) return key;
  }
  return type;
}

function parseQty(val: string): { num: number; unit: string } {
  const match = val.match(/^([\d.,½¼¾⅓⅔]+)\s*(.*)$/);
  if (!match) return { num: 0, unit: val };
  let num = parseFloat(match[1].replace(",", "."));
  if (isNaN(num)) {
    const fractions: Record<string, number> = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 0.33, "⅔": 0.67 };
    num = fractions[match[1]] || 0;
  }
  return { num, unit: match[2].trim() };
}

function combineQty(you: string, her: string): string {
  if (you === "—" || !you) return her;
  if (her === "—" || !her) return you;
  const a = parseQty(you);
  const b = parseQty(her);
  const total = a.num + b.num;
  const display = total % 1 === 0 ? total.toString() : total.toFixed(1).replace(/\.0$/, "");
  return `${display}${a.unit ? " " + a.unit : ""}`;
}

export const WeeklySchedule = () => {
  const [approvedMeals, setApprovedMeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("approved-meals");
      if (saved) setApprovedMeals(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleApproved = (dayIdx: number, mealIdx: number) => {
    const key = `${dayIdx}-${mealIdx}`;
    setApprovedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      localStorage.setItem("approved-meals", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const pivotData = useMemo(() => {
    const result: { day: string; meals: Record<string, { meal: typeof VISUAL_PLAN_SCHEDULE[0]["meals"][0]; dayIdx: number; mealIdx: number }> } = [];
    VISUAL_PLAN_SCHEDULE.forEach((day, dayIdx) => {
      const mealsMap: Record<string, { meal: typeof VISUAL_PLAN_SCHEDULE[0]["meals"][0]; dayIdx: number; mealIdx: number }> = {};
      day.meals.forEach((meal, mealIdx) => {
        const type = getMealType(meal.type);
        mealsMap[type] = { meal, dayIdx, mealIdx };
      });
      result.push({ day: day.day, meals: mealsMap });
    });
    return result;
  }, []);

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] mb-4 flex items-center gap-2">
        <span className="text-base">🗓️</span> Тижневий розклад
      </h2>
      <div className="text-xs text-[#7b80a0] mb-3 flex gap-4">
        <span className="flex items-center gap-1"><span className="text-[#f7a948]">📦</span> = з prep</span>
        <span className="flex items-center gap-1"><span className="text-[#ff6584]">🍳</span> = вранці</span>
      </div>

      <div className="overflow-x-auto">
        <table className="table-fixed w-full border-separate border-spacing-2 text-left">
          <thead>
            <tr>
              <th className="p-2 text-[8px] font-mono uppercase text-[#7b80a0] bg-[#222535] border border-[#2e3147] w-12">День</th>
              {MEAL_ORDER.map((type) => (
                <th key={type} className="p-2 text-[8px] font-mono uppercase text-[#7b80a0] bg-[#222535] border border-[#2e3147] w-[19%]">
                  {type}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pivotData.map((dayRow) => (
              <tr key={dayRow.day}>
                <td className={`p-2 text-body font-bold border border-[#2e3147] text-center align-top ${
                  ["Сб", "Нд"].includes(dayRow.day) ? "bg-[#6c63ff1f] text-[#6c63ff]" : "bg-[#1a1d27]"
                }`}>
                  {dayRow.day}
                </td>
                {MEAL_ORDER.map((type) => {
                  const slot = dayRow.meals[type];
                  if (!slot) return <td key={type} className="p-2 border border-[#2e3147] bg-[#1a1d27]/40 text-[#7b80a0] text-note italic align-top">—</td>;
                  
                  const { meal, dayIdx, mealIdx } = slot;
                  const key = `${dayIdx}-${mealIdx}`;
                  const isApproved = approvedMeals.has(key);

                  return (
                    <td key={type} className={`p-2 px-3 rounded-lg border-2 align-top h-px ${isApproved ? "border-[#43d98c] bg-[#43d98c0a]" : "border-[#4a4d65] bg-[#1a1d27]"}`}>
                      <div className="flex flex-col h-full">
                        <div className={`flex justify-between items-center mb-2 pb-1.5 border-b ${isApproved ? "border-[#43d98c]/30" : "border-[#2e3147]"}`}>
                          <span className={`text-[10px] font-bold ${isApproved ? "text-[#43d98c]" : "text-[#e8eaf0]"}`}>
                            {meal.type}
                          </span>
                          <button onClick={() => toggleApproved(dayIdx, mealIdx)} className="shrink-0 ml-1 transition-colors">
                            {isApproved ? (
                              <CheckCircle2 size={12} className="text-[#43d98c]" />
                            ) : (
                              <Circle size={12} className="text-[#7b80a0] hover:text-[#43d98c]" />
                            )}
                          </button>
                        </div>
                        <div className="flex-1 grid grid-cols-[1fr_46px_46px_46px] gap-x-1 gap-y-0 text-[10px] content-start">
                          <span className="text-[7px] font-mono uppercase text-[#7b80a0]">Продукт</span>
                          <span className="text-[7px] font-mono uppercase text-right text-[#6c63ff]">Я</span>
                          <span className="text-[7px] font-mono uppercase text-right text-[#ff6584]">Вона</span>
                          <span className="text-[7px] font-mono uppercase text-right text-[#e8eaf0]">Σ</span>
                          {meal.ingredients.map((ing, iIdx) => (
                            <React.Fragment key={iIdx}>
                              <span className={`break-words leading-tight ${
                                ing.dishId
                                  ? isApproved ? "text-[#43d98c]" : "text-[#f7a948]"
                                  : isApproved ? "text-[#43d98c]" : "text-[#e8eaf0]"
                              }`}>
                                {ing.name}
                                {ing.dishId && <span className="text-[8px] ml-0.5">📋</span>}
                                {ing.isPrep && <span className="text-[#f7a948] text-[8px]">📦</span>}
                                {ing.isCook && <span className="text-[#ff6584] text-[8px]">🍳</span>}
                              </span>
                              <span className={`text-right ${isApproved ? "text-[#43d98c]" : "text-[#6c63ff]"}`}>{ing.you}</span>
                              <span className={`text-right ${isApproved ? "text-[#43d98c]" : "text-[#ff6584]"}`}>{ing.her}</span>
                              <span className={`text-right ${isApproved ? "text-[#43d98c]" : "text-[#7b80a0]"}`}>{combineQty(ing.you, ing.her)}</span>
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="flex gap-1.5 pt-1 mt-1 border-t border-[#2e3147]/50">
                          <span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${isApproved ? "bg-[#43d98c26] text-[#43d98c]" : "bg-[#6c63ff26] text-[#6c63ff]"}`}>
                            {meal.kcalYou}
                          </span>
                          <span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${isApproved ? "bg-[#43d98c26] text-[#43d98c]" : "bg-[#ff658426] text-[#ff6584]"}`}>
                            {meal.kcalHer}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
