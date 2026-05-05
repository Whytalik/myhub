import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-4 p-16 bg-surface/30 border border-dashed border-border/40 rounded-3xl ${className ?? ""}`}>
      <div className="p-3 rounded-2xl bg-raised/60 text-muted">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-secondary">{title}</p>
        {description && (
          <p className="text-[11px] font-mono text-muted">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
