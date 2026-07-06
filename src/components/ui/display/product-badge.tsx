import { Check, Sparkles, AlertTriangle, LucideIcon } from "lucide-react";

export type ProductBadgeStatus = "tracked" | "pantry" | "unknown";

export const PRODUCT_BADGE_CONFIG: Record<
  ProductBadgeStatus,
  { style: string; icon: LucideIcon; label: string }
> = {
  tracked: {
    style: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    icon: Check,
    label: "В системі",
  },
  pantry: {
    style: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    icon: Sparkles,
    label: "Спеція",
  },
  unknown: {
    style: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    icon: AlertTriangle,
    label: "Поза системою",
  },
};

interface ProductBadgeProps {
  status: ProductBadgeStatus;
  className?: string;
}

export function ProductBadge({ status, className = "" }: ProductBadgeProps) {
  const config = PRODUCT_BADGE_CONFIG[status];
  const Icon = config.icon;
  const badgeClass = `inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide ${config.style} ${className}`;

  return (
    <span className={badgeClass}>
      <Icon size={10} strokeWidth={3} />
      {config.label}
    </span>
  );
}
