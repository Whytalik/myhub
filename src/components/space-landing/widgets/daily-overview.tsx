import { LucideIcon } from "lucide-react";

interface DailyItem {
  label: string;
  value: string;
  icon?: LucideIcon;
  status?: "complete" | "partial" | "pending";
}

interface DailyOverviewProps {
  title?: string;
  items: DailyItem[];
}

export function DailyOverview({ title = "Today", items }: DailyOverviewProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">{title}</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {item.icon && <item.icon size={10} className="text-accent/60" />}
              <p className="text-[9px] font-mono text-muted uppercase tracking-[0.2em]">{item.label}</p>
            </div>
            <p className="text-lg font-heading text-text uppercase tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
