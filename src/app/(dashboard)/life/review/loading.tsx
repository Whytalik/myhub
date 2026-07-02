import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewLoading() {
  return (
    <div className="px-8 py-8 flex flex-col gap-6">
      {/* PageHeader */}
      <div className="flex flex-col mb-0">
        <Skeleton className="h-3 w-40 mb-4" />
        <Skeleton className="h-9 w-44 mb-1" />
        <div className="pl-3 border-l-2 border-border/30">
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
      </div>

      {/* Week selector */}
      <Skeleton className="h-10 w-48 rounded-xl" />

      {/* Tabs */}
      <Skeleton className="h-10 w-80 rounded-xl" />

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
