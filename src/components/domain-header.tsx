"use client";

import { useState } from "react";
import { useSidebar } from "./sidebar-provider";
import { Menu, X, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSpaceFromPath } from "@/lib/spaces";
import { DOMAINS, getActiveDomain } from "@/lib/domains";
import { GUIDE_DATA } from "@/lib/guide-data";
import { GuideModal } from "@/components/guide-drawer";

export function DomainHeader() {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const [guideOpen, setGuideOpen] = useState(false);
  const hasGuide = !!GUIDE_DATA[getSpaceFromPath(pathname)];
  const activeDomainId = getActiveDomain(pathname).id;

  return (
    <header className="min-h-20 border-b border-border-dim bg-bg/60 backdrop-blur-xl sticky top-0 z-[60] px-4 py-3 flex flex-col justify-center gap-2.5 shrink-0 lg:h-20 lg:py-0 lg:flex-row lg:items-center lg:justify-between">
      {/* Mobile: Burger + Logo */}
      <div className="flex lg:hidden items-center justify-between w-full">
        <Link href="/life" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-bg" />
          </div>
          <span className="text-heading font-bold tracking-tight leading-none text-text-primary">
            MyHub
          </span>
        </Link>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-300"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Domain switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isActive = activeDomainId === domain.id;
          return (
            <Link
              key={domain.id}
              href={domain.href}
              className="flex items-center gap-2 h-9 px-3.5 rounded-lg text-note font-medium border transition-all duration-200 shrink-0"
              style={{
                color: isActive ? domain.accent : undefined,
                backgroundColor: isActive ? `${domain.accent}12` : "transparent",
                borderColor: isActive ? `${domain.accent}30` : "var(--color-border-dim)",
              }}
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
              <span>{domain.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Guide button */}
      <div className="hidden lg:flex items-center gap-3">
        {hasGuide && (
          <button
            onClick={() => setGuideOpen(true)}
            className="inline-flex items-center gap-2 h-8 px-4 rounded-lg text-note font-medium border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:border-border-strong transition-all duration-200"
          >
            <BookOpen size={13} />
            Guide
          </button>
        )}
      </div>

      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </header>
  );
}
