import React from "react";
import { VISUAL_PLAN_GOALS, VISUAL_PLAN_SCHEDULE } from "../../constants/visual-plan-data";

const goalYou = VISUAL_PLAN_GOALS.find((g) => g.who === "Ви")?.kcal ?? 0;
const goalHer = VISUAL_PLAN_GOALS.find((g) => g.who === "Дівчина")?.kcal ?? 0;

const dailyTotals = VISUAL_PLAN_SCHEDULE.map((day) => ({
  day: day.day,
  you: day.meals.reduce((s, m) => s + m.kcalYou, 0),
  her: day.meals.reduce((s, m) => s + m.kcalHer, 0),
}));

export const DailyGoals = () => {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] mb-4 flex items-center gap-2">
        <span className="text-base">📊</span> Денні цілі
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VISUAL_PLAN_GOALS.map((goal, idx) => (
          <div 
            key={idx} 
            className={`bg-[#1a1d27] border border-[#2e3147] rounded-xl p-6 border-t-4 ${
              goal.who === "Ви" ? "border-t-[#6c63ff]" : "border-t-[#ff6584]"
            }`}
          >
            <div className={`text-body font-semibold uppercase tracking-wide mb-1 ${
              goal.who === "Ви" ? "text-[#6c63ff]" : "text-[#ff6584]"
            }`}>
              {goal.who}
            </div>
            <div className="text-xs text-[#7b80a0] mb-4">{goal.label}</div>
            <div className="text-xl font-extrabold leading-none mb-4 flex items-baseline gap-2">
              {goal.kcal} <span className="text-xs font-normal text-[#7b80a0]">ккал</span>
            </div>
            
            <div className="flex gap-3 mb-5">
              <div className="flex-1 bg-[#222535] rounded-lg p-2.5 text-center">
                <div className="text-base font-bold text-[#43d98c]">{goal.macros.p}г</div>
                <div className="text-note text-[#7b80a0]">Білки</div>
              </div>
              <div className="flex-1 bg-[#222535] rounded-lg p-2.5 text-center">
                <div className="text-base font-bold text-[#f7a948]">{goal.macros.f}г</div>
                <div className="text-note text-[#7b80a0]">Жири</div>
              </div>
              <div className="flex-1 bg-[#222535] rounded-lg p-2.5 text-center">
                <div className="text-base font-bold text-[#4fa3e0]">{goal.macros.c}г</div>
                <div className="text-note text-[#7b80a0]">Вуглев.</div>
              </div>
              <div className="flex-1 bg-[#222535] rounded-lg p-2.5 text-center">
                <div className="text-base font-bold text-[#a78bfa]">{goal.macros.fiber}г</div>
                <div className="text-note text-[#7b80a0]">Клітков.</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {goal.tags.map((tag, tIdx) => (
                <span key={tIdx} className="bg-[#222535] rounded-full px-2.5 py-1 text-xs text-[#7b80a0]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-[10px] font-mono uppercase text-[#7b80a0] mb-3 tracking-wider">Фактично по днях</div>
        <div className="grid grid-cols-7 gap-2">
          {dailyTotals.map(({ day, you, her }) => {
            const overYou = you > goalYou;
            const overHer = her > goalHer;
            return (
              <div key={day} className={`bg-[#1a1d27] border rounded-lg p-2 text-center ${
                ["Сб", "Нд"].includes(day) ? "border-[#6c63ff]/30" : "border-[#2e3147]"
              }`}>
                <div className={`text-[10px] font-bold mb-2 ${["Сб", "Нд"].includes(day) ? "text-[#6c63ff]" : "text-[#7b80a0]"}`}>
                  {day}
                </div>
                <div className={`text-[11px] font-semibold leading-tight ${overYou ? "text-[#ff6b6b]" : "text-[#6c63ff]"}`}>
                  {you}
                </div>
                <div className={`text-[9px] mb-1 ${overYou ? "text-[#ff6b6b]/60" : "text-[#6c63ff]/50"}`}>
                  / {goalYou}
                </div>
                <div className={`text-[11px] font-semibold leading-tight ${overHer ? "text-[#ff6b6b]" : "text-[#ff6584]"}`}>
                  {her}
                </div>
                <div className={`text-[9px] ${overHer ? "text-[#ff6b6b]/60" : "text-[#ff6584]/50"}`}>
                  / {goalHer}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2 text-[9px] text-[#7b80a0]">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#6c63ff]" /> Я (ціль {goalYou})</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#ff6584]" /> Вона (ціль {goalHer})</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#ff6b6b]" /> Перевищення</span>
        </div>
      </div>
    </section>
  );
};
