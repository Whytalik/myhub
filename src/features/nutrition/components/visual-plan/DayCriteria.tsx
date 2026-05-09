"use client";

import { DAY_CRITERIA } from "../../constants/visual-plan-data";

const priorityColors = {
  critical: { dot: "bg-red-500", badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "критично" },
  important: { dot: "bg-[#f7a948]", badge: "bg-[#f7a948]/10 text-[#f7a948] border-[#f7a948]/20", label: "важливо" },
  nice: { dot: "bg-[#7b80a0]", badge: "bg-[#7b80a0]/10 text-[#7b80a0] border-[#7b80a0]/20", label: "бажано" },
};

export const DayCriteria = () => {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] mb-4 flex items-center gap-2">
        <span className="text-base">📋</span> Критерії оцінки дня
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {DAY_CRITERIA.map((c) => {
          const colors = priorityColors[c.priority];
          return (
            <div
              key={c.id}
              className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                  <span className="text-sm font-semibold text-white">{c.label}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${colors.badge}`}>
                  {colors.label}
                </span>
              </div>

              <p className="text-[11px] text-[#7b80a0] leading-relaxed">{c.description}</p>

              <div className="mt-auto pt-2 border-t border-[#2e3147] grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[9px] font-mono text-[#7b80a0] uppercase mb-0.5">Ви</div>
                  <div className="text-[11px] font-mono text-[#6c63ff] font-semibold">{c.thresholdYou}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-[#7b80a0] uppercase mb-0.5">Дівчина</div>
                  <div className="text-[11px] font-mono text-[#ff6584] font-semibold">{c.thresholdHer}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 text-[10px] text-[#7b80a0]">
        {Object.entries(priorityColors).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${val.dot}`} />
            {val.label}
          </span>
        ))}
      </div>
    </section>
  );
};
