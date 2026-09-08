"use client";

import type { Dispatch, SetStateAction } from "react";
import { Activity, ChevronDown, ChevronRight } from "lucide-react";

interface SessionWarmupSectionProps {
  warmupCollapsed: boolean;
  setWarmupCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function SessionWarmupSection({
  warmupCollapsed,
  setWarmupCollapsed,
}: SessionWarmupSectionProps) {
  return (
    <div className="bg-amber-500/[0.02] border border-amber-500/10 rounded-xl p-3 flex flex-col gap-2">
      <div
        onClick={() => setWarmupCollapsed(!warmupCollapsed)}
        className="flex items-center justify-between cursor-pointer select-none group/warmup"
      >
        <div className="flex items-center gap-2 text-amber-400">
          <Activity size={16} />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">
            1. Розминка (Протокол RAMP)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span>~8-10 хв</span>
          <span>{warmupCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}</span>
        </div>
      </div>

      {!warmupCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1 border-t border-white/[0.04] mt-1">
          {/* Raise */}
          <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              1. Підвищення (Raise)
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              3–5 хвилин легкого кардіо (еліпс, велотренажер або швидка ходьба). Підвищує
              температуру тіла, еластичність м&apos;язів та ЧСС.
            </p>
          </div>

          {/* Activate & Mobilize */}
          <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              2. Мобілізація (Mobilize)
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Динамічні обертання плечових суглобів, розкриття грудного відділу хребта, 10 присідань
              без ваги та 12 сідничних містків.
            </p>
          </div>

          {/* Potentiate */}
          <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              3. Активація (Potentiate)
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              1–2 легкі розминочні підходи з 50% від робочої ваги для першої вправи дня, щоб
              підготувати ЦНС та суглоби.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
