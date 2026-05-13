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
        // Make the first item span 2 columns on large screens if there are more than 2 items
        const isWide = items.length > 2 && index === 0;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-1 ${
              isWide ? "sm:col-span-2 lg:col-span-2" : ""
            }`}
          >
            {/* Background Gradient on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-bg transition-colors duration-300">
                  <Icon size={24} />
                </div>
                <span className="text-xs font-mono text-muted uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                  Open
                </span>
              </div>
              
              <div className="mt-auto">
                <h3 className="text-heading font-bold text-text group-hover:text-accent transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-note text-text-secondary leading-relaxed">
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
