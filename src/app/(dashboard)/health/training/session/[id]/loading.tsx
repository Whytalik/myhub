import { Skeleton } from "@/components/ui/display/skeleton";

export default function TrainingSessionLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 pb-6 mb-6 border-b border-white/[0.06]">
        <Skeleton className="h-3 w-40 rounded" />
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-24 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
