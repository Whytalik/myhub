"use client";

import { Brain } from "lucide-react";

interface Props {
  emotions: string[] | null;
  onChange: (patch: { emotions: string[] | null }) => void;
}

const MENTAL_STATES = [
  { label: "Sharp", positive: true },
  { label: "Creative", positive: true },
  { label: "Focus", positive: true },
  { label: "Flow", positive: true },
  { label: "Productive", positive: true },
  { label: "Procrastinating", positive: false },
  { label: "Bored", positive: false },
  { label: "Distracted", positive: false },
  { label: "Foggy", positive: false },
];

const EMOTIONAL_STATES = [
  { label: "Joyful", positive: true },
  { label: "Grateful", positive: true },
  { label: "Inspired", positive: true },
  { label: "Confident", positive: true },
  { label: "Content", positive: true },
  { label: "Excited", positive: true },
  { label: "Hopeful", positive: true },
  { label: "Irritated", positive: false },
  { label: "Sad", positive: false },
  { label: "Lonely", positive: false },
  { label: "Angry", positive: false },
  { label: "Guilty", positive: false },
  { label: "Insecure", positive: false },
];

const PHYSICAL_STATES = [
  { label: "Calm", positive: true },
  { label: "Relaxed", positive: true },
  { label: "Balanced", positive: true },
  { label: "Energized", positive: true },
  { label: "Stressed", positive: false },
  { label: "Anxious", positive: false },
  { label: "Tired", positive: false },
  { label: "Overwhelmed", positive: false },
  { label: "Burned out", positive: false },
  { label: "Restless", positive: false },
];

export function EmotionsSection({ emotions, onChange }: Props) {
  const hasValue = (emotions?.length ?? 0) > 0;

  const toggleEmotion = (emotion: string) => {
    const current = emotions ?? [];
    const next = current.includes(emotion)
      ? current.filter(e => e !== emotion)
      : [...current, emotion];
    onChange({ emotions: next.length > 0 ? next : null });
  };

  const EmotionColumn = ({ title, items }: { title: string, items: typeof MENTAL_STATES }) => (
    <div className="flex flex-col gap-3 flex-1">
      <span className="text-[9px] font-mono uppercase text-muted font-bold tracking-widest px-1">
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
              className={`px-2 py-1 rounded-lg border text-[10px] font-medium transition-all ${colorClass} ${
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

  return (
    <div className={`bg-surface border rounded-2xl p-6 flex flex-col gap-6 transition-all ${
      hasValue ? "border-accent/20 shadow-[0_0_15px_rgba(192,132,252,0.03)]" : "border-border"
    }`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 px-1">
          <Brain size={14} className="text-accent" />
          <h3 className={`text-[13px] font-medium transition-colors ${hasValue ? "text-accent" : "text-text"}`}>
            Emotions & States
          </h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 relative">
          <EmotionColumn title="Mental" items={MENTAL_STATES} />
          
          <div className="hidden md:block w-px bg-border/50 self-stretch mt-6" />
          
          <EmotionColumn title="Emotional" items={EMOTIONAL_STATES} />
          
          <div className="hidden md:block w-px bg-border/50 self-stretch mt-6" />
          
          <EmotionColumn title="Stress & Energy" items={PHYSICAL_STATES} />
        </div>
      </div>
    </div>
  );
}
