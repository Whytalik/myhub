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
    <div className="bg-surface/50 border border-border-dim rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <h4 className="text-[10px] font-mono text-muted uppercase tracking-[0.3em]">{title}</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[9px] font-mono text-muted uppercase mb-1.5">{item.label}</p>
            <p className="text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
