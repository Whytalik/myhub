"use client";

import { useState } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { Menu, X, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSpaceFromPath } from "@/lib/spaces/spaces";
import { DOMAINS, getActiveDomain } from "@/lib/spaces/domains";
import { GUIDE_DATA } from "@/lib/guide-data";
import { GuideModal } from "@/components/layout/guide-drawer";

export function DomainHeader() {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const [guideOpen, setGuideOpen] = useState(false);
  const hasGuide = !!GUIDE_DATA[getSpaceFromPath(pathname)];
  const activeDomainId = getActiveDomain(pathname).id;

  return (
    <header className="h-16 border-b border-white/5 px-4 md:px-8 flex items-center justify-between flex-shrink-0 bg-surface/20 backdrop-blur-md sticky top-0 z-30 select-none w-full">
      {/* Mobile Brand & Hamburger */}
      <div className="flex md:hidden items-center justify-between w-full">
        <Link href="/life" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--current-accent)]/10 text-[var(--current-accent)] flex items-center justify-center border border-[var(--current-accent)]/20">
            <Sparkles size={14} className="text-[var(--current-accent)]" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            MyHub
          </span>
        </Link>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Domain Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isActive = activeDomainId === domain.id;
          return (
            <Link
              key={domain.id}
              href={domain.href}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-all duration-150 ${
                isActive
                  ? "text-[var(--current-accent)] bg-[var(--current-accent-muted)]/10 border border-[var(--current-accent)]/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[var(--current-accent)]" : "text-zinc-500"} />
              <span>{domain.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right side Actions (Desktop) */}
      <div className="hidden md:flex items-center gap-3">
        {hasGuide && (
          <button
            onClick={() => setGuideOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all duration-150 cursor-pointer"
          >
            <BookOpen size={13} className="text-zinc-500" />
            Guide
          </button>
        )}
      </div>

      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </header>
  );

}
