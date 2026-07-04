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
  <div >
    <span >
      {title}
    </span>
    <div >
      {items.map((item) => {
        const active = emotions?.includes(item.label);
        const colorClass = item.positive
          ? active
            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 font-bold"
            : "hover:border-emerald-500/20"
          : active
            ? "bg-rose-500/10 border-rose-500/40 text-rose-600 font-bold"
            : "hover:border-rose-500/20";

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => toggleEmotion(item.label)}

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

  const toggleEmotion = (emotion: string) => {
    const current = emotions ?? [];
    const next = current.includes(emotion)
      ? current.filter((e) => e !== emotion)
      : [...current, emotion];
    onChange({ emotions: next.length > 0 ? next : null });
  };

  return (
    <div

    >
      <div >
        <div >
          <Brain size={14} />
          <h3

          >
            Емоції та стани
          </h3>
        </div>

        <div >
          <EmotionColumn
            title="Ментальний стан"
            items={MENTAL_STATES}
            emotions={emotions}
            toggleEmotion={toggleEmotion}
          />

          <div />

          <EmotionColumn
            title="Емоційний стан"
            items={EMOTIONAL_STATES}
            emotions={emotions}
            toggleEmotion={toggleEmotion}
          />

          <div />

          <EmotionColumn
            title="Стрес та енергія"
            items={PHYSICAL_STATES}
            emotions={emotions}
            toggleEmotion={toggleEmotion}
          />
        </div>
      </div>
    </div>
  );
}
