import { Skeleton } from "@/components/ui/display/skeleton";

export default function WeekTemplateLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 pb-6 mb-6 border-b border-white/[0.06]">
        <Skeleton className="h-3 w-40 rounded" />
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      <div className="glass-card p-3">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-2 flex flex-col items-center gap-1.5">
              <Skeleton className="h-3 w-8 rounded" />
              <Skeleton className="h-3 w-6 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
