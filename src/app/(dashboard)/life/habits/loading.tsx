import { Skeleton } from "@/components/ui/skeleton";

export default function HabitsLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="flex justify-between items-start mb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-5 h-5 rounded" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <Skeleton key={d} className="w-6 h-6 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
