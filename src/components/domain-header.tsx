"use client";

import { useSpace } from "./space-provider";
import { useSidebar } from "./sidebar-provider";
import { 
  Briefcase, 
  Shield, 
  Brain, 
  Database, 
  Package,
  Menu,
  X,
  Sparkles,
  Lock
} from "lucide-react";
import Link from "next/link";

const DOMAIN_STATUS: Record<string, "active" | "locked"> = {
  operations: "active",
  health: "active",
  mind: "locked",
  wealth: "locked",
  vault: "locked",
};

const DOMAINS_CONFIG = [
  { id: "operations", label: "Operations", icon: Briefcase, href: "/operations" },
  { id: "health",     label: "Health",     icon: Shield,    href: "/health" },
  { id: "mind",       label: "Mind",       icon: Brain,     href: "/mind" },
  { id: "wealth",     label: "Wealth",     icon: Database,  href: "/wealth" },
  { id: "vault",      label: "Vault",      icon: Package,   href: "/vault" },
];

export function DomainHeader() {
  const { activeDomain } = useSpace();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  const visibleDomains = DOMAINS_CONFIG;

  return (
    <header className="h-16 border-b border-border bg-bg/80 backdrop-blur-xl sticky top-0 z-[60] px-4 flex items-center justify-between shrink-0 overflow-hidden">
      <div className="flex items-center gap-3 w-full lg:w-auto">
        {/* Mobile: Burger + Logo */}
        <div className="flex lg:hidden items-center justify-between w-full">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
              <Sparkles size={16} className="text-bg" fill="currentColor" />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase leading-none">MYHUB</span>
          </Link>

          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl text-muted hover:text-text hover:bg-raised transition-all duration-300"
            aria-label="Toggle Spaces Menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Desktop: Domains List */}
        <div className="hidden lg:flex items-center gap-1">
          {visibleDomains.map((domain) => {
            const Icon = domain.icon;
            const isActive = activeDomain === domain.id;
            const status = DOMAIN_STATUS[domain.id] ?? "active";
            const isLocked = status === "locked";
            
            return (
              <div
                key={domain.id}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-500 shrink-0 ${
                  isLocked
                    ? "opacity-30 cursor-not-allowed"
                    : isActive 
                      ? "bg-accent/10 border border-accent/20" 
                      : "hover:bg-raised border border-transparent"
                }`}
              >
                <Icon 
                  size={14} 
                  className={`transition-colors duration-300 ${
                    isLocked ? "text-muted" : isActive ? "text-accent" : "text-muted group-hover:text-text"
                  }`} 
                />
                <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                  isLocked ? "text-muted" : isActive ? "text-text" : "text-muted"
                }`}>
                  {domain.label}
                </span>
                {isLocked && <Lock size={10} className="text-muted/40" />}
                {!isLocked && (
                  <Link href={domain.href} className="absolute inset-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3">
        {/* Desktop actions placeholder */}
      </div>
    </header>
  );
}
