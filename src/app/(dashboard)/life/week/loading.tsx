import { Skeleton } from "@/components/ui/skeleton";

export default function WeekTemplateLoading() {
  return (
    <div className="px-8 py-8 flex flex-col gap-6">
      {/* PageHeader */}
      <div className="flex flex-col mb-0">
        <Skeleton className="h-3 w-40 mb-4" />
        <Skeleton className="h-9 w-44 mb-1" />
        <div className="pl-3 border-l-2 border-border/30">
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 p-4 bg-surface border border-border rounded-2xl">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-8" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border border-border/60 bg-raised/30">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-2.5 w-7" />
                </div>
              ))}
            </div>
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-3" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}
