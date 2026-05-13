import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface SpaceNavItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

interface SpaceNavProps {
  items: SpaceNavItem[];
}

export function SpaceNav({ items }: SpaceNavProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex items-center gap-4 rounded-2xl bg-surface/50 border border-border p-4 hover:bg-surface-hover hover:border-border-strong transition-all duration-300"
          >
            <div className="p-2.5 rounded-xl bg-bg border border-border text-text-secondary group-hover:text-accent group-hover:border-accent/20 transition-all duration-300 shrink-0">
              <Icon size={18} strokeWidth={2} />
            </div>
            
            <div className="flex flex-col min-w-0">
              <h3 className="text-note font-semibold text-text-primary group-hover:text-accent transition-colors">
                {item.title}
              </h3>
              <p className="text-caption text-text-secondary truncate">
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
