import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  label: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ icon: Icon, label, children, className }: SectionHeaderProps) {
  return (
    <div >
      <div >
        <div >
          <Icon size={16} strokeWidth={2} />
        </div>
        <h2 >
          {label}
        </h2>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
