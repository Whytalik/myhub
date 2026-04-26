import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary";
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-12">
      {actions.map((action) => {
        const isPrimary = action.variant !== "secondary";
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-[0.15em] transition-all hover:scale-105 ${
              isPrimary
                ? "bg-accent text-bg hover:bg-accent/90"
                : "bg-surface border border-border text-text hover:bg-raised"
            }`}
          >
            <action.icon size={12} />
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
