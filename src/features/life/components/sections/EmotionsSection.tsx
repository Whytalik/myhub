"use client";

import { Brain } from "lucide-react";

interface Props {
  emotions: string[] | null;
  onChange: (patch: { emotions: string[] | null }) => void;
}

const MENTAL_STATES = [
  { label: "Ясний розум", positive: true },
  { label: "Креативний", positive: true },
  { label: "Зосереджений", positive: true },
  { label: "В потоці", positive: true },
  { label: "Продуктивний", positive: true },
  { label: "Прокрастинація", positive: false },
  { label: "Нудьга", positive: false },
  { label: "Відволікання", positive: false },
  { label: "Туман в голові", positive: false },
];

const EMOTIONAL_STATES = [
  { label: "Радісний", positive: true },
  { label: "Вдячний", positive: true },
  { label: "Натхненний", positive: true },
  { label: "Впевнений", positive: true },
  { label: "Задоволений", positive: true },
  { label: "Захоплений", positive: true },
  { label: "Оптимістичний", positive: true },
  { label: "Роздратований", positive: false },
  { label: "Сумний", positive: false },
  { label: "Самотній", positive: false },
  { label: "Злий", positive: false },
  { label: "Винуватий", positive: false },
  { label: "Невпевнений", positive: false },
];

const PHYSICAL_STATES = [
  { label: "Спокійний", positive: true },
  { label: "Розслаблений", positive: true },
  { label: "Збалансований", positive: true },
  { label: "Енергійний", positive: true },
  { label: "Стрес", positive: false },
  { label: "Тривожний", positive: false },
  { label: "Втомлений", positive: false },
  { label: "Перевантажений", positive: false },
  { label: "Вигорання", positive: false },
  { label: "Неспокійний", positive: false },
];

interface EmotionColumnProps {
  title: string;
  items: { label: string; positive: boolean }[];
  emotions: string[] | null;
  toggleEmotion: (emotion: string) => void;
}

const EmotionColumn = ({ title, items, emotions, toggleEmotion }: EmotionColumnProps) => (
  <div className="flex flex-col gap-3 flex-1">
    <span className="text-label font-mono uppercase text-muted font-bold tracking-widest px-1">
      {title}
    </span>
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => {
        const active = emotions?.includes(item.label);
        const colorClass = item.positive 
          ? active ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 font-bold" : "hover:border-emerald-500/20"
          : active ? "bg-rose-500/10 border-rose-500/40 text-rose-600 font-bold" : "hover:border-rose-500/20";
        
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => toggleEmotion(item.label)}
            className={`px-2 py-1 rounded-lg border text-caption font-medium transition-all ${colorClass} ${
              !active ? "bg-raised border-border text-secondary hover:text-text" : ""
            }`}
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
      ? current.filter(e => e !== emotion)
      : [...current, emotion];
    onChange({ emotions: next.length > 0 ? next : null });
  };

  return (
    <div className={`bg-surface border rounded-xl p-6 flex flex-col gap-6 transition-all ${
      hasValue ? "border-accent/20 shadow-[0_0_15px_rgba(192,132,252,0.03)]" : "border-border"
    }`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 px-1">
          <Brain size={14} className="text-accent" />
          <h3 className={`text-body font-medium transition-colors ${hasValue ? "text-accent" : "text-text"}`}>
            Емоції та стани
          </h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 relative">
          <EmotionColumn title="Ментальний стан" items={MENTAL_STATES} emotions={emotions} toggleEmotion={toggleEmotion} />
          
          <div className="hidden md:block w-px bg-border/50 self-stretch mt-6" />
          
          <EmotionColumn title="Емоційний стан" items={EMOTIONAL_STATES} emotions={emotions} toggleEmotion={toggleEmotion} />
          
          <div className="hidden md:block w-px bg-border/50 self-stretch mt-6" />
          
          <EmotionColumn title="Стрес та енергія" items={PHYSICAL_STATES} emotions={emotions} toggleEmotion={toggleEmotion} />
        </div>
      </div>
    </div>
  );
}
