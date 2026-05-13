import { Skeleton } from "@/components/ui/skeleton";

interface SpaceSkeletonProps {
  tileCount?: number;
  hasIntelligence?: boolean;
  variant?: "space" | "domain";
}

export function SpaceSkeleton({ tileCount = 3, hasIntelligence = false, variant = "space" }: SpaceSkeletonProps) {
  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex flex-col mb-10">
        <div className="mb-4">
          <Skeleton className="h-3 w-24 mb-2" />
        </div>
        <Skeleton className="h-10 w-48 mb-3" />
        <div className="h-px w-full bg-border-dim mt-4 mb-3" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Problem/Solution/Result */}
      <div className="mb-6 rounded-2xl bg-surface/50 border border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-1 p-4 rounded-xl bg-surface/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-danger/60" />
              <Skeleton className="h-2 w-20" />
            </div>
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="hidden md:flex shrink-0 items-center justify-center">
            <Skeleton className="w-5 h-5 rounded" />
          </div>
          <div className="flex-1 p-4 rounded-xl bg-surface/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              <Skeleton className="h-2 w-20" />
            </div>
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="hidden md:flex shrink-0 items-center justify-center">
            <Skeleton className="w-5 h-5 rounded" />
          </div>
          <div className="flex-1 p-4 rounded-xl bg-surface/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-success/60" />
              <Skeleton className="h-2 w-16" />
            </div>
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>

      {/* Navigation Tiles */}
      {variant === "domain" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: tileCount }).map((_, i) => (
            <div key={i} className={`rounded-2xl border border-border bg-surface p-6 ${i === 0 ? "md:col-span-2" : ""}`}>
              <div className="flex items-start justify-between mb-6">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-5 h-5 rounded" />
              </div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
              <div className="mt-4 pt-3 border-t border-border/30">
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

      {/* Intelligence */}
      {hasIntelligence && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-px flex-1 bg-border/50" />
            <Skeleton className="h-2 w-40" />
            <Skeleton className="h-px flex-1 bg-border/50" />
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
