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
      <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
          <h4 className="text-micro font-bold uppercase tracking-widest text-text-muted">{title}</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.label} className="bg-bg/40 rounded-[var(--radius-md)] px-3 py-2.5 border border-border-dim">
              <p className="text-micro font-bold text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-note font-semibold text-text-primary">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
