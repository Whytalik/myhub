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
    <div >
      <div >

        {}
        <span >
          {dateLabel}
        </span>

        {}
        <div >
          <span >{emoji}</span>
          <h1 >
            {text}!
          </h1>
        </div>

        {}
        {yesterdayBrainDump && (
          <div >
            <p >
              Вчорашні думки
            </p>
            <p >
              {yesterdayBrainDump}
            </p>
          </div>
        )}

        {}
        <button
          onClick={handleStart}
          disabled={isPending}

        >
          {isPending ? (
            <Loader2 size={16} />
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
