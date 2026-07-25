"use client";
import { Textarea } from "@/components/ui/inputs/textarea";
import { HintTooltip } from "@/components/ui/overlays/tooltip";

import { Trophy, RefreshCw, Heart, Trash2, Search } from "lucide-react";

interface Props {
  winToday: string | null;
  improveTomorrow: string | null;
  gratitude: string | null;
  brainDump: string | null;
  frictionToday: string | null;
  onChange: (patch: {
    winToday?: string | null;
    improveTomorrow?: string | null;
    gratitude?: string | null;
    brainDump?: string | null;
    frictionToday?: string | null;
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
  {
    key: "brainDump" as const,
    icon: Trash2,
    label: "Brain Dump",
    placeholder: "Clear your mind before sleep. Worries, ideas, random thoughts...",
    hint: "Unload every open loop: worries, ideas, tomorrow's tasks. Writing them out offloads working memory — in a Baylor sleep-lab study, a specific pre-bed to-do list helped people fall asleep ~9 minutes faster.",
  },
  {
    key: "frictionToday" as const,
    icon: Search,
    label: "Kaizen: Friction Today",
    placeholder: "What took more time or energy than it should have?",
    hint: "Log one thing that took more time or energy than it deserved. Treat it as data, not self-blame — you're collecting friction points so tomorrow's fix has a real target.",
  },
  {
    key: "improveTomorrow" as const,
    icon: RefreshCw,
    label: "Kaizen: Fix for Tomorrow",
    placeholder: "One small tweak to make it easier next time",
    hint: "Pick one tiny tweak that removes today's friction — so small it's impossible to skip. Kaizen compounds through 1% adjustments, not grand overhauls; check weekly which tweaks stuck.",
  },
];

export function ReflectionSection({
  winToday,
  improveTomorrow,
  gratitude,
  brainDump,
  frictionToday,
  onChange,
}: Props) {
  const values = { winToday, improveTomorrow, gratitude, brainDump, frictionToday };

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
