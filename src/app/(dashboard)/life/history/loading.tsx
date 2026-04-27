import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
