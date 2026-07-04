import { Skeleton } from "@/components/ui/display/skeleton";

export default function HistoryLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 pb-6 mb-6 border-b border-white/[0.06]">
        <Skeleton className="h-3 w-40 rounded" />
        <Skeleton className="h-6 w-24 rounded-lg" />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {["All", "Weeks", "Months", "Quarters", "Years"].map((t) => (
          <Skeleton key={t} className="h-8 w-16 rounded-lg" />
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <Skeleton className="h-3 w-28 rounded" />
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="flex flex-col gap-2">
              {Array.from({ length: groupIdx === 0 ? 5 : 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
