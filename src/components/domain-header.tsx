"use client";

import { useSpace } from "./space-provider";
import { 
  Briefcase, 
  Shield, 
  Brain, 
  Database, 
  Package,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const domains = [
  { id: "operations", label: "Operations", icon: Briefcase, color: "#fbbf24", href: "/operations" },
  { id: "health",     label: "Health",     icon: Shield,    color: "#f0a868", href: "/health" },
  { id: "mind",       label: "Mind",       icon: Brain,     color: "#818cf8", href: "/mind" },
  { id: "wealth",     label: "Wealth",     icon: Database,  color: "#22c55e", href: "/wealth" },
  { id: "vault",      label: "Vault",      icon: Package,   color: "#a3a3a3", href: "/vault" },
] as const;

export function DomainHeader() {
  const { activeDomain } = useSpace();
  const router = useRouter();

  return (
    <header className="h-14 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 md:px-6 justify-between">
      <div className="flex items-center gap-1 md:gap-1.5">
        {domains.map((domain) => {
          const isActive = activeDomain === domain.id;
          const Icon = domain.icon;

          return (
            <Link
              key={domain.id}
              href={domain.href}
              className={`group relative flex flex-col items-center justify-center w-10 md:w-16 h-10 rounded-lg transition-all ${
                isActive 
                  ? "bg-accent/10 text-accent shadow-sm border border-accent/20" 
                  : "text-muted hover:text-text hover:bg-raised/50 border border-transparent"
              }`}
              title={domain.label}
            >
              <Icon 
                size={16} 
                strokeWidth={isActive ? 2.5 : 2}
                style={isActive ? { color: domain.color } : undefined}
                className="transition-transform group-hover:scale-110"
              />
              <span className={`hidden md:block text-[8px] font-bold uppercase tracking-widest mt-1 ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"}`}>
                {domain.label}
              </span>
            </Link>
          );
        })}
      </div>


      <div className="flex items-center gap-3">
        {/* Placeholder for global search or notifications */}
      </div>
    </header>
  );
}
