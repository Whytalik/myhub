"use client";

import { LucideIcon, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface SpaceNavTileProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  stats?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export function SpaceNavTile({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  stats, 
  variant = "secondary",
  className = "" 
}: SpaceNavTileProps) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={`
        group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-500
        ${isPrimary 
          ? "bg-surface border-accent/20 hover:border-accent/40 shadow-glow" 
          : "bg-surface/40 border-border/50 hover:bg-surface/60 hover:border-border-strong"}
        ${className}
      `}
    >
      {/* Hover Background Accent */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none
        ${isPrimary ? "bg-accent" : "bg-text-primary"}
      `} />

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`
            p-3 rounded-xl border transition-all duration-500
            ${isPrimary 
              ? "bg-accent text-bg border-accent/20" 
              : "bg-bg border-border text-text-secondary group-hover:text-accent group-hover:border-accent/20"}
          `}>
            <Icon size={24} strokeWidth={1.5} />
          </div>
          <div className="text-text-muted opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div>
          <h3 className={`
            text-subtitle font-bold mb-1 transition-colors
            ${isPrimary ? "text-accent" : "text-text-primary group-hover:text-accent"}
          `}>
            {title}
          </h3>
          <p className="text-note text-text-secondary leading-snug">
            {description}
          </p>
        </div>
      </div>

      {stats && (
        <div className="px-6 py-4 bg-bg/50 border-t border-border/30 mt-auto">
          <span className="text-micro font-bold uppercase tracking-widest text-text-muted group-hover:text-accent-hover transition-colors">
            {stats}
          </span>
        </div>
      )}
    </Link>
  );
}
