import { Skeleton } from "@/components/ui/skeleton";

interface SpaceSkeletonProps {
  tileCount?: number;
  hasIntelligence?: boolean;
  variant?: "space" | "domain";
  hasDescription?: boolean;
}

export function SpaceSkeleton({ 
  tileCount = 3, 
  hasIntelligence = false, 
  variant = "space",
  hasDescription = true
}: SpaceSkeletonProps) {
  return (
    <div className="pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col mb-10 relative">
        <div className="mb-4">
          <Skeleton className="h-3 w-24" />
        </div>
        
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-64 mb-1" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
      </div>

      <main className="space-y-12">
        {/* Thesis Block (SpaceDescription) */}
        {hasDescription && (
          <div className="mb-8 relative rounded-2xl bg-surface/40 border border-border/50 p-6 md:p-10">
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
              {/* Problem */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>

              {/* Arrow (Desktop) */}
              <div className="hidden lg:flex shrink-0 items-center justify-center">
                <Skeleton className="w-8 h-px" />
                <Skeleton className="w-4 h-4 mx-2 rounded-full" />
                <Skeleton className="w-8 h-px" />
              </div>

              {/* Solution */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>

              {/* Arrow (Desktop) */}
              <div className="hidden lg:flex shrink-0 items-center justify-center">
                <Skeleton className="w-8 h-px" />
                <Skeleton className="w-4 h-4 mx-2 rounded-full" />
                <Skeleton className="w-8 h-px" />
              </div>

              {/* Result */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tiles/List */}
        {(tileCount > 0) && (
          <div className="mb-12">
            {variant === "domain" && (
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-3 w-32" />
              </div>
            )}

            {variant === "domain" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: tileCount }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`
                      rounded-2xl border border-border/50 bg-surface/40 p-6 flex flex-col justify-between min-h-[200px]
                      ${i === 0 ? "md:col-span-2" : ""}
                    `}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <Skeleton className="w-5 h-5 rounded" />
                    </div>
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/30">
                      <Skeleton className="h-2 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Array.from({ length: tileCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl bg-surface/50 border border-border p-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Intelligence */}
      {hasIntelligence && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50" />
            <div className="flex items-center gap-2">
               <Skeleton className="h-1.5 w-1.5 rounded-full" />
               <Skeleton className="h-3 w-40" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/30 bg-surface/30 px-4 py-4">
                <Skeleton className="h-2 w-16 mb-2" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
