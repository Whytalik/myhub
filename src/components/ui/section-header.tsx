import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  label: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ icon: Icon, label, children, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-[var(--radius-sm)] bg-accent/10 text-accent">
          <Icon size={16} strokeWidth={2} />
        </div>
        <h2 className="text-note font-semibold text-text-secondary">
          {label}
        </h2>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
