import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  href?: string;
  trend?: "up" | "down" | "neutral";
}

interface StatsSummaryProps {
  stats: StatCard[];
  className?: string;
}

export function StatsSummary({ stats, className }: StatsSummaryProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 ${className || ""}`}>
      {stats.map((stat) => {
        const content = (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-mono text-muted uppercase tracking-[0.2em]">{stat.label}</p>
              {stat.icon && <stat.icon size={11} className="text-accent/60" />}
            </div>
            <p className="text-lg font-heading text-text uppercase tracking-tight">{stat.value}</p>
          </>
        );

        if (stat.href) {
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-surface border border-border p-4 rounded-xl hover:bg-raised transition-all cursor-pointer block"
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={stat.label}
            className="bg-surface border border-border p-4 rounded-xl"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
