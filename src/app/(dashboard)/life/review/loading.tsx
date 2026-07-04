import { Skeleton } from "@/components/ui/display/skeleton";

export default function ReviewLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 pb-6 mb-6 border-b border-white/[0.06]">
        <Skeleton className="h-3 w-40 rounded" />
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {["Summary", "Trends", "Patterns", "Recap"].map((t) => (
          <Skeleton key={t} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
