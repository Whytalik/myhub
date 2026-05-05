import { Skeleton } from "@/components/ui/skeleton";

export default function PlansLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-20 mb-6" />
      <div className="flex justify-between items-start mb-8">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((m) => (
                <Skeleton key={m} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
