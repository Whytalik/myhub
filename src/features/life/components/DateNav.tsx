"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, History } from "lucide-react";

interface Props {
  dateStr: string; // "YYYY-MM-DD"
}

function offset(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function DateNav({ dateStr }: Props) {
  const isToday = dateStr === todayStr();
  const prev = offset(dateStr, -1);
  const next = offset(dateStr, 1);

  const label = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/life/journal?date=${prev}`}
        className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:border-accent/40 transition-all"
      >
        <ChevronLeft size={16} />
      </Link>

      <span className="text-[13px] font-medium text-secondary capitalize min-w-48 text-center">
        {isToday ? <span className="text-accent">Today</span> : label}
      </span>

      <Link
        href={isToday ? "#" : `/life/journal?date=${next}`}
        className={`p-1.5 rounded-lg border transition-all ${
          isToday
            ? "border-border/30 text-muted/30 cursor-default pointer-events-none"
            : "border-border text-muted hover:text-text hover:border-accent/40"
        }`}
      >
        <ChevronRight size={16} />
      </Link>

      <div className="w-px h-5 bg-border mx-1" />

      <Link
        href="/life/journal/history"
        className="flex items-center gap-1.5 text-[12px] text-muted hover:text-text transition-colors"
      >
        <History size={14} />
        All entries
      </Link>
    </div>
  );
}
