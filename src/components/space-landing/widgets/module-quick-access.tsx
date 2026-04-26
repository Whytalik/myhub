import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ModuleCard {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  status?: string;
  count?: string;
  badge?: string;
}

interface ModuleQuickAccessProps {
  modules: ModuleCard[];
}

export function ModuleQuickAccess({ modules }: ModuleQuickAccessProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
      {modules.map((module) => (
        <Link
          key={module.href}
          href={module.href}
          className="group relative bg-surface border border-border p-6 rounded-xl hover:bg-raised transition-all duration-300 hover:border-accent/40 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <span className="font-heading text-7xl uppercase leading-none tracking-tighter -mr-6">
              {module.title}
            </span>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading text-4xl text-text uppercase leading-none tracking-tight group-hover:text-accent transition-colors">
                  {module.title}
                </h3>
                <div className="flex items-center gap-2">
                  {module.status && (
                    <span className="text-[9px] font-mono text-accent uppercase tracking-[0.2em]">
                      {module.status}
                    </span>
                  )}
                  {module.count && (
                    <span className="text-[9px] font-mono text-accent uppercase tracking-[0.2em] bg-accent/10 px-1.5 py-0.5 rounded">
                      {module.count}
                    </span>
                  )}
                  {module.badge && (
                    <span className="text-[9px] font-mono text-muted uppercase tracking-[0.2em]">
                      {module.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/10 text-accent group-hover:scale-110 transition-transform">
                <module.icon size={20} />
              </div>
            </div>
            <p className="text-secondary text-xs leading-relaxed mb-5 max-w-[80%]">
              {module.description}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted hover:text-text transition-colors">
              <span>Enter Space</span>
              <span>→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
