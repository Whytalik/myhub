import { Skeleton } from "@/components/ui/display/skeleton";

export default function WeekTemplateLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 pb-6 mb-6 border-b border-white/[0.06]">
        <Skeleton className="h-3 w-40 rounded" />
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-10 rounded" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
