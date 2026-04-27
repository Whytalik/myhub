import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-3 w-32 mb-4" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-28 mb-4" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
