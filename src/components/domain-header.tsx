"use client";

import { useState } from "react";
import { useSidebar } from "./sidebar-provider";
import { Menu, X, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSpaceFromPath } from "@/lib/spaces";
import { GUIDE_DATA } from "@/lib/guide-data";
import { GuideModal } from "@/components/guide-drawer";

export function DomainHeader() {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const [guideOpen, setGuideOpen] = useState(false);
  const hasGuide = !!GUIDE_DATA[getSpaceFromPath(pathname)];

  return (
    <header className="h-20 border-b border-border-dim bg-bg/60 backdrop-blur-xl sticky top-0 z-[60] px-4 flex items-center justify-between shrink-0 overflow-hidden">
      {/* Mobile: Burger + Logo */}
      <div className="flex lg:hidden items-center justify-between w-full">
        <Link href="/life" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-bg" />
          </div>
          <span className="text-heading font-bold tracking-tight leading-none text-text-primary">MyHub</span>
        </Link>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-300"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop: empty left side (sidebar handles navigation) */}
      <div className="hidden lg:block" />

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
