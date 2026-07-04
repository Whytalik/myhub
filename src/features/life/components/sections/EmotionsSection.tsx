"use client";

import { Brain } from "lucide-react";
import { MENTAL_STATES, EMOTIONAL_STATES, PHYSICAL_STATES } from "@/lib/life/emotion-taxonomy";

interface Props {
  emotions: string[] | null;
  onChange: (patch: { emotions: string[] | null }) => void;
}

interface EmotionColumnProps {
  title: string;
  items: { label: string; positive: boolean }[];
  emotions: string[] | null;
  toggleEmotion: (emotion: string) => void;
}

const EmotionColumn = ({ title, items, emotions, toggleEmotion }: EmotionColumnProps) => (
  <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
    <span className="text-label">{title}</span>
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const active = emotions?.includes(item.label);
        const colorClass = item.positive
          ? active
            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold"
            : "border-white/[0.08] text-zinc-400 hover:border-emerald-500/20 hover:text-zinc-200"
          : active
            ? "bg-rose-500/10 border-rose-500/40 text-rose-400 font-semibold"
            : "border-white/[0.08] text-zinc-400 hover:border-rose-500/20 hover:text-zinc-200";
        const buttonClass = `px-2.5 py-1 rounded-lg border text-xs transition-colors duration-150 ${colorClass}`;

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => toggleEmotion(item.label)}
            className={buttonClass}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  </div>
);

export function EmotionsSection({ emotions, onChange }: Props) {
  const hasValue = (emotions?.length ?? 0) > 0;
  const cardClass = `glass-card p-4 flex flex-col gap-4 border ${hasValue ? "border-accent/20" : "border-white/[0.06]"}`;

  const toggleEmotion = (emotion: string) => {
    const current = emotions ?? [];
    const next = current.includes(emotion)
      ? current.filter((e) => e !== emotion)
      : [...current, emotion];
    onChange({ emotions: next.length > 0 ? next : null });
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center gap-2">
        <Brain size={14} className="text-accent" />
        <h3 className="text-panel-title">Емоції та стани</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <EmotionColumn
          title="Ментальний стан"
          items={MENTAL_STATES}
          emotions={emotions}
          toggleEmotion={toggleEmotion}
        />
        <div className="hidden sm:block w-px bg-white/[0.06]" />
        <EmotionColumn
          title="Емоційний стан"
          items={EMOTIONAL_STATES}
          emotions={emotions}
          toggleEmotion={toggleEmotion}
        />
        <div className="hidden sm:block w-px bg-white/[0.06]" />
        <EmotionColumn
          title="Стрес та енергія"
          items={PHYSICAL_STATES}
          emotions={emotions}
          toggleEmotion={toggleEmotion}
        />
      </div>
    </div>
  );
}
