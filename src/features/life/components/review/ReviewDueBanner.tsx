import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { format } from "date-fns";

interface ReviewDueBannerProps {
  weekStart: string;
}

export function ReviewDueBanner({ weekStart }: ReviewDueBannerProps) {
  return (
    <Link
      href={`/life/planning/review?week=${format(new Date(weekStart), "yyyy-MM-dd")}`}
      className="glass-card p-3 flex items-center gap-3 border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.06] transition-colors duration-150"
    >
      <ClipboardCheck size={16} className="text-amber-400 shrink-0" />
      <span className="text-sm text-amber-300">
        Your weekly review is due. Take 30 minutes to close the week and plan the next one →
      </span>
    </Link>
  );
}
