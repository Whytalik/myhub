import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  accentClassName?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  accentClassName = "bg-accent/10 text-accent",
  action,
  className = "",
}: EmptyStateProps) {
  const wrapperClass =
    `glass-card p-8 flex flex-col items-center gap-3 text-center ${className}`.trim();
  const iconWrapperClass = `flex items-center justify-center w-14 h-14 rounded-2xl ${accentClassName}`;

  return (
    <div className={wrapperClass}>
      {Icon && (
        <div className={iconWrapperClass}>
          <Icon size={32} />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-panel-title">{title}</p>
        {description && <p className="text-caption max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
