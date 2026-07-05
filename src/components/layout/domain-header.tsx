"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";
import { Menu, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOMAINS, getActiveDomain } from "@/lib/spaces/domains";

export function DomainHeader() {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const activeDomainId = getActiveDomain(pathname).id;

  return (
    <header className="h-12 border-b border-zinc-800/60 px-4 md:px-8 flex items-center justify-between flex-shrink-0 bg-surface sticky top-0 z-30 select-none w-full">
      {/* Mobile Brand & Hamburger */}
      <div className="flex md:hidden items-center justify-between w-full">
        <Link href="/life" className="flex items-center gap-2.5">
          <div className="w-5.5 h-5.5 rounded bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
            <Sparkles size={11} className="text-accent" />
          </div>
          <span className="text-xs font-semibold text-zinc-100 tracking-tight">MyHub</span>
        </Link>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Desktop Domain Navigation */}
      <div className="hidden md:flex items-center gap-1.5">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isActive = activeDomainId === domain.id;
          const isLifeDomain = domain.id === "life";
          const domainAccentClass = isLifeDomain ? "text-accent-life" : "text-accent-nutrition";
          const domainActiveClass = isLifeDomain
            ? "text-zinc-50 bg-accent-life/20 border border-accent-life/30 shadow-sm"
            : "text-zinc-50 bg-accent-nutrition/20 border border-accent-nutrition/30 shadow-sm";
          const domainLinkClass = `flex items-center gap-2 px-3.5 py-1 rounded-md text-xs font-medium outline-none focus:outline-none transition-all duration-150 ${
            isActive
              ? domainActiveClass
              : "text-zinc-400 hover:text-zinc-250 hover:bg-white/5 border border-transparent"
          }`;
          const domainIconClass = isActive ? domainAccentClass : "text-zinc-500";
          const domainIconStrokeWidth = isActive ? 2.5 : 2;

          return (
            <Link key={domain.id} href={domain.href} className={domainLinkClass}>
              <Icon size={13} strokeWidth={domainIconStrokeWidth} className={domainIconClass} />
              <span>{domain.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right side Actions (Desktop) */}
      <div className="hidden md:flex items-center gap-3" />
    </header>
  );
}
