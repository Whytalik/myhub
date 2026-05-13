"use client";

interface IntelligenceItem {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
}

interface SpaceIntelligenceProps {
  title?: string;
  items: IntelligenceItem[];
}

export function SpaceIntelligence({ title = "System Intelligence", items }: SpaceIntelligenceProps) {
  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50" />
        <div className="flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
           <h4 className="text-micro font-bold uppercase tracking-[0.2em] text-text-muted">{title}</h4>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div 
            key={item.label} 
            className="group relative bg-surface/30 rounded-xl px-4 py-4 border border-border/30 hover:bg-surface/50 hover:border-accent/20 transition-all duration-300 overflow-hidden"
          >
            {/* Subtle progress background or pattern could go here */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-accent opacity-0 group-hover:opacity-100 transition-all duration-500 w-full transform origin-left scale-x-0 group-hover:scale-x-100" />
            
            <p className="text-micro font-bold text-text-muted uppercase tracking-wider mb-2 transition-colors group-hover:text-text-secondary">
              {item.label}
            </p>
            <p className="text-heading font-bold text-text-primary tracking-tight">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
