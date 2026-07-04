import { Skeleton } from "@/components/ui/display/skeleton";

export default function TasksLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-3 w-40 rounded" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {["Gallery", "Calendar", "Graph"].map((v) => (
              <Skeleton key={v} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <Skeleton className="h-3 w-24 rounded" />
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: groupIdx === 0 ? 4 : 2 }).map((_, i) => (
                <div key={i} className="glass-card p-3.5 flex flex-col gap-2">
                  <Skeleton className="h-4 w-2/3 rounded" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
