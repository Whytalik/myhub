"use client";

import { Trophy, RefreshCw, Heart, Trash2 } from "lucide-react";

interface Props {
  winToday: string | null;
  improveTomorrow: string | null;
  gratitude: string | null;
  brainDump: string | null;
  onChange: (patch: {
    winToday?: string | null;
    improveTomorrow?: string | null;
    gratitude?: string | null;
    brainDump?: string | null;
  }) => void;
}

const PROMPTS = [
  {
    key: "winToday" as const,
    icon: Trophy,
    label: "Top Win",
    placeholder: "What specific thing went well today?",
  },
  {
    key: "gratitude" as const,
    icon: Heart,
    label: "Grateful For",
    placeholder: "A specific person, moment, or detail",
  },
  {
    key: "brainDump" as const,
    icon: Trash2,
    label: "Brain Dump",
    placeholder: "Clear your mind before sleep. Worries, ideas, random thoughts...",
  },
  {
    key: "improveTomorrow" as const,
    icon: RefreshCw,
    label: "Do Better Tomorrow",
    placeholder: "One concrete action for tomorrow",
  },
];

export function ReflectionSection({ winToday, improveTomorrow, gratitude, brainDump, onChange }: Props) {
  const values = { winToday, improveTomorrow, gratitude, brainDump };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[11px] font-mono text-muted uppercase tracking-[0.3em]">Reflection</span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      <div className="flex flex-col gap-4">
        {PROMPTS.map(({ key, icon: Icon, label, placeholder }) => {
          const hasValue = !!values[key];
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon size={13} className={hasValue ? "text-accent" : "text-muted"} />
                <label className={`text-[12px] font-medium ${hasValue ? "text-accent" : "text-text"}`}>{label}</label>
              </div>
              <textarea
                value={values[key] ?? ""}
                onChange={(e) => onChange({ [key]: e.target.value || null })}
                placeholder={placeholder}
                rows={2}
                className={`bg-raised/50 border rounded-xl px-3 py-2.5 text-sm transition-all resize-none leading-relaxed outline-none ${
                  hasValue 
                    ? "border-accent/40 text-text shadow-[0_0_15px_rgba(192,132,252,0.05)]" 
                    : "border-border text-secondary placeholder:text-muted/40 focus:border-accent/40"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
