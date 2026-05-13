import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-3 w-32 mb-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3">
            <Skeleton className="w-4 h-4 rounded" />
            <div>
              <Skeleton className="h-5 w-8 mb-1" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sprint */}
          <div className="bg-surface rounded-xl border border-border/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-4 mb-3">
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-24 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-surface rounded-xl border border-border/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="w-3.5 h-3.5 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Habits */}
          <div className="bg-surface rounded-xl border border-border/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg/30">
                  <Skeleton className="w-3.5 h-3.5 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* North Star */}
          <div className="bg-surface rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-4">
              <div>
                <Skeleton className="h-2 w-20 mb-1" />
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-full" />
              </div>
              <div>
                <Skeleton className="h-2 w-16 mb-1" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>

          {/* Attention */}
          <div className="bg-surface rounded-xl border border-danger/20 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-2 w-24 mb-2" />
                  <div className="space-y-1.5">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2 px-2 py-1.5 rounded">
                        <Skeleton className="w-3 h-3 rounded" />
                        <Skeleton className="h-3 flex-1" />
                        <Skeleton className="h-4 w-12 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-surface rounded-xl border border-border/50 p-5">
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg/30">
                  <Skeleton className="w-3.5 h-3.5 rounded" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
