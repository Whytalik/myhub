"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  emoji?: string;
  titleClass?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  emoji,
  titleClass = "text-[#7b80a0]",
  defaultOpen = true,
  children,
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 mb-4 group"
      >
        <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${titleClass}`}>
          {emoji && <span className="text-base">{emoji}</span>}
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#7b80a0] transition-transform duration-200 shrink-0 group-hover:text-text ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && children}
    </section>
  );
}
