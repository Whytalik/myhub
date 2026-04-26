import React from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArrowRight, Lock, LucideIcon } from "lucide-react";

type SpaceStatus = "active" | "dev" | "soon" | "disabled";

interface SpaceCard {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  status?: SpaceStatus;
}

interface Metric {
  label: string;
  value: React.ReactNode;
}

interface DomainTemplateProps {
  domainId: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  spaces: SpaceCard[];
  metrics: Metric[];
}

const statusConfig: Record<SpaceStatus, { badge: string; badgeBg: string; badgeBorder: string }> = {
  active: { badge: "Active", badgeBg: "bg-emerald-500/10", badgeBorder: "border-emerald-500/20" },
  dev: { badge: "In Dev", badgeBg: "bg-amber-500/10", badgeBorder: "border-amber-500/20" },
  soon: { badge: "Soon", badgeBg: "bg-blue-500/10", badgeBorder: "border-blue-500/20" },
  disabled: { badge: "Locked", badgeBg: "bg-muted/10", badgeBorder: "border-muted/20" },
};

export function DomainTemplate({
  domainId,
  title,
  subtitle,
  description,
  icon: DomainIcon,
  color,
  spaces,
  metrics,
}: DomainTemplateProps) {
  return (
    <div className="relative min-h-full flex flex-col">
      {/* Background Decor */}
      <div 
        className="absolute top-0 left-0 right-0 h-[200px] opacity-[0.04] pointer-events-none transition-colors duration-700"
        style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }}
      />
      
      <div className="relative px-6 md:px-14 py-4 md:py-6 flex-1 flex flex-col w-full max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: domainId }]} />
        
        {/* Hero Section - Compact & Stable */}
        <div className="mt-4 mb-6 shrink-0">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-1 rounded-lg bg-surface border border-border/40 shadow-sm shrink-0">
               <DomainIcon size={16} style={{ color: color }} strokeWidth={2.5} />
             </div>
             <span className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold opacity-80" style={{ color: color }}>
               {subtitle}
             </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading text-text leading-[1] tracking-tighter mb-2 uppercase">
            {title.split(' ').map((word, i) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i !== title.split(' ').length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <p className="text-xs text-secondary leading-relaxed max-w-xl line-clamp-2">
            {description}
          </p>
        </div>

        {/* Core Spaces Grid - Compact Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 shrink-0">
          {spaces.map((s) => {
            const status = s.status ?? "active";
            const config = statusConfig[status];
            const isDisabled = status === "disabled";

            return (
              <div
                key={s.label}
                className={`group relative border p-4 rounded-3xl transition-all duration-500 overflow-hidden flex items-center gap-4 ${
                  isDisabled
                    ? "bg-surface/50 border-border/30 opacity-50 cursor-not-allowed"
                    : "bg-surface border-border hover:bg-raised"
                }`}
              >
                {!isDisabled && (
                  <Link href={s.href} className="absolute inset-0 z-10" />
                )}
                <div className="absolute top-0 right-0 p-3 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                  <s.icon size={80} />
                </div>
                <div className={`w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center shadow-lg shrink-0 ${
                  !isDisabled ? "group-hover:border-accent/40 transition-colors" : ""
                }`}>
                  <s.icon size={20} style={{ color: isDisabled ? "var(--color-muted)" : s.color }} strokeWidth={2} />
                </div>
                <div className="relative z-[5] flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-text uppercase leading-none">{s.label}</h3>
                    <span className={`text-[7px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${config.badgeBg} ${config.badgeBorder} ${
                      status === "disabled" ? "text-muted/50" : status === "dev" ? "text-amber-400" : status === "soon" ? "text-blue-400" : "text-emerald-400"
                    }`}>
                      {config.badge}
                    </span>
                  </div>
                  <p className="text-secondary text-[11px] leading-tight line-clamp-1 opacity-70">
                    {s.description}
                  </p>
                </div>
                {isDisabled ? (
                  <Lock size={12} className="text-muted/30 shrink-0" />
                ) : (
                  <ArrowRight size={12} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mr-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Metrics - Fixed at the very bottom of viewport */}
        <div className="mt-auto grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border/40 pt-6 pb-2 shrink-0">
          {metrics.map((m, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <h4 className="text-[7px] font-mono uppercase tracking-widest font-bold opacity-40" style={{ color: color }}>
                {m.label}
              </h4>
              <div className="flex items-center gap-2">
                 <span className="text-xl font-heading text-text tracking-tighter uppercase leading-none">{m.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
