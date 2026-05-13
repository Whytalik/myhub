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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col gap-3 p-5 rounded-xl bg-surface border border-border hover:border-accent/30 hover:bg-surface-hover transition-all"
          >
            <div className="p-2.5 rounded-lg bg-accent/8 w-fit group-hover:bg-accent/15 transition-colors">
              <Icon size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-body font-medium text-text group-hover:text-accent transition-colors">{item.title}</h3>
              <p className="text-caption text-text-secondary mt-1 leading-relaxed">{item.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
