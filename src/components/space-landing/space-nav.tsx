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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-start gap-3 p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all"
          >
            <div className="p-2 rounded-lg bg-accent/8 w-fit shrink-0 group-hover:bg-accent/15 transition-colors">
              <Icon size={18} className="text-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="text-note font-medium text-text group-hover:text-accent transition-colors truncate">{item.title}</h3>
              <p className="text-caption text-text-secondary mt-0.5 leading-snug">{item.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
