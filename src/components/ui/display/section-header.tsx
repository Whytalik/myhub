import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  label: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ icon: Icon, label, children, className = "" }: SectionHeaderProps) {
  const wrapperClass = `flex items-center justify-between gap-4 ${className}`;

  return (
    <div className={wrapperClass}>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center p-1.5 rounded-md bg-accent/10 text-accent">
          <Icon size={16} strokeWidth={2} />
        </div>
        <h2 className="text-panel-title">{label}</h2>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
