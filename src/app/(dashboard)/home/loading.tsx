import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="px-6 py-8 md:px-14 md:py-12 w-full">
      <div className="mb-10">
        <Skeleton className="h-3 w-32 mb-1" />
        <Skeleton className="h-3 w-40 mb-3" />
        <Skeleton className="h-14 w-48 mb-4" />
        <div className="h-0.5 w-12 bg-accent mt-4" />
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-6 bg-surface border border-border rounded-2xl px-6 py-4 mb-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="w-4 h-4 rounded" />
            <div>
              <Skeleton className="h-5 w-8 mb-1" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-12">
        {[1, 2, 3].map((group) => (
          <div key={group}>
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1, 2, 3].map((card) => (
                <div key={card} className="flex flex-col items-center justify-center gap-3 aspect-square rounded-2xl border border-border bg-surface p-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
