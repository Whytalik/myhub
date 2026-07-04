"use client";
import { Textarea } from "@/components/ui/inputs/textarea";

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
    <div >
      <div >
        <div />
        <span >Reflection</span>
        <div />
      </div>

      <div >
        {PROMPTS.map(({ key, icon: Icon, label, placeholder }) => {
          const hasValue = !!values[key];
          return (
            <div key={key} >
              <div >
                <Icon size={13} />
                <label >{label}</label>
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
