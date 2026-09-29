"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface PlaybookStepProps {
  number: number;
  title: string;
  hint: string;
  isDone: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function PlaybookStep({
  number,
  title,
  hint,
  isDone,
  defaultOpen = false,
  children,
}: PlaybookStepProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const badgeClassName = `flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold shrink-0 ${
    isDone ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.06] text-zinc-400"
  }`;
  const chevronClassName = `text-zinc-500 transition-transform duration-150 ${isOpen ? "rotate-0" : "-rotate-90"}`;

  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors duration-150"
      >
        <span className={badgeClassName}>{isDone ? <Check size={14} /> : number}</span>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-panel-title">{title}</span>
          <span className="text-caption truncate">{hint}</span>
        </div>
        <ChevronDown size={16} className={chevronClassName} />
      </button>
      {isOpen && <div className="px-4 pb-4 pt-1 flex flex-col gap-3">{children}</div>}
    </div>
  );
}
