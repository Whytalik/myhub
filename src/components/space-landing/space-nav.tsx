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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isWide = items.length > 2 && index === 0;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative overflow-hidden rounded-[1rem] bg-surface border border-border p-5 hover:bg-surface-hover hover:border-border-strong transition-all duration-300 ${
              isWide ? "sm:col-span-2 lg:col-span-2" : ""
            }`}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <div className="p-2 rounded-lg bg-bg border border-border text-text-secondary group-hover:text-accent group-hover:border-accent/20 transition-all duration-300">
                  <Icon size={18} strokeWidth={2} />
                </div>
              </div>
              
              <div className="mt-auto">
                <h3 className="text-note font-semibold text-text-primary group-hover:text-accent transition-colors mb-1.5">
                  {item.title}
                </h3>
                <p className="text-caption text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
