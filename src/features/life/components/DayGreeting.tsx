"use client";

import { useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  dateStr: string;
  yesterdayBrainDump: string | null;
  onStart: () => void;
}

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: "Доброго ранку", emoji: "☀️" };
  if (h >= 12 && h < 18) return { text: "Доброго дня", emoji: "🌤️" };
  return { text: "Добрий вечір", emoji: "🌙" };
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" });
}

export function DayGreeting({ dateStr, yesterdayBrainDump, onStart }: Props) {
  const [isPending, startTransition] = useTransition();
  const { text, emoji } = getGreeting();
  const dateLabel = formatDate(dateStr);

  const handleStart = () => {
    startTransition(() => {
      onStart();
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass-card p-8 flex flex-col items-center gap-4 max-w-md w-full text-center">
        <span className="text-label capitalize">{dateLabel}</span>

        <div className="flex items-center gap-3">
          <span className="text-4xl">{emoji}</span>
          <h1 className="text-page-title text-2xl">{text}!</h1>
        </div>

        {yesterdayBrainDump && (
          <div className="w-full glass-card p-3 flex flex-col gap-1 text-left">
            <p className="text-label">Вчорашні думки</p>
            <p className="text-caption">{yesterdayBrainDump}</p>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-accent text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Розпочати день
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
