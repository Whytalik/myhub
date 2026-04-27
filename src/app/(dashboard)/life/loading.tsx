import { Skeleton } from "@/components/ui/skeleton";

export default function LifeLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-12 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />

      <div className="space-y-10">
        <div className="bg-surface border border-border rounded-xl p-6">
          <Skeleton className="h-3 w-16 mb-4" />
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="w-4 h-4 rounded" />
                <div>
                  <Skeleton className="h-5 w-12 mb-1" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
