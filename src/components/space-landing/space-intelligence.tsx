"use client";

interface IntelligenceItem {
  label: string;
  value: string;
}

interface SpaceIntelligenceProps {
  title?: string;
  items: IntelligenceItem[];
}

export function SpaceIntelligence({ title = "Space Intelligence", items }: SpaceIntelligenceProps) {
  return (
    <div className="mt-8">
      <div className="bg-surface/80 backdrop-blur-xl border border-border-dim rounded-xl p-4 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <h4 className="text-note font-mono text-muted uppercase tracking-[0.3em]">{title}</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.label} className="bg-raised/30 rounded-lg px-2.5 py-2 border border-border-dim/50">
              <p className="text-[9px] font-mono text-muted uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-xs font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
