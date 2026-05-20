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
  if (h >= 5 && h < 12)  return { text: "Доброго ранку",  emoji: "☀️" };
  if (h >= 12 && h < 18) return { text: "Доброго дня",    emoji: "🌤️" };
  return                          { text: "Добрий вечір",  emoji: "🌙" };
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-8 max-w-lg w-full text-center">

        {/* Date */}
        <span className="text-caption font-mono text-muted uppercase tracking-[0.3em]">
          {dateLabel}
        </span>

        {/* Greeting */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">{emoji}</span>
          <h1 className="text-[2rem] font-bold tracking-tight text-text-primary leading-tight">
            {text}!
          </h1>
        </div>

        {/* Yesterday's brain dump */}
        {yesterdayBrainDump && (
          <div className="w-full bg-surface border border-border rounded-xl p-5 text-left">
            <p className="text-caption font-mono text-muted uppercase tracking-wider mb-3">
              Вчорашні думки
            </p>
            <p className="text-body text-text-secondary leading-relaxed whitespace-pre-wrap line-clamp-6">
              {yesterdayBrainDump}
            </p>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={isPending}
          className="inline-flex items-center gap-2.5 h-12 px-8 rounded-xl bg-accent text-bg font-semibold text-body hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
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
