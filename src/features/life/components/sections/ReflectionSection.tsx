"use client";
import { Textarea } from "@/components/ui/inputs/textarea";
import { HintTooltip } from "@/components/ui/overlays/tooltip";

import { Trophy, Heart } from "lucide-react";

interface Props {
  winToday: string | null;
  gratitude: string | null;
  onChange: (patch: {
    winToday?: string | null;
    gratitude?: string | null;
  }) => void;
}

const PROMPTS = [
  {
    key: "winToday" as const,
    icon: Trophy,
    label: "Top Win",
    placeholder: "What specific thing went well today?",
    hint: 'Write one concrete win and why it happened. Naming the cause is what makes this work — in Seligman\'s "Three Good Things" study, people who did it daily were measurably happier even 6 months later.',
  },
  {
    key: "gratitude" as const,
    icon: Heart,
    label: "Grateful For",
    placeholder: "A specific person, moment, or detail",
    hint: 'Name a specific person, moment, or detail — not a generic "family" or "health". Fresh, concrete entries keep gratitude effective; repeating the same vague items dulls the benefit.',
  },
];

export function ReflectionSection({ winToday, gratitude, onChange }: Props) {
  const values = { winToday, gratitude };

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-label">Reflection</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROMPTS.map(({ key, icon: Icon, label, placeholder, hint }) => {
          const hasValue = !!values[key];
          const labelClass = `text-label ${hasValue ? "text-accent" : ""}`;

          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Icon size={13} />
                <label className={labelClass}>{label}</label>
                <HintTooltip hint={hint} />
              </div>
              <Textarea
                value={values[key] ?? ""}
                onChange={(e) => onChange({ [key]: e.target.value || null })}
                placeholder={placeholder}
                rows={2}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
