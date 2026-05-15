import { Skeleton } from "@/components/ui/skeleton";

export default function ShoppingLoading() {
  return (
    <div className="px-8 py-8">
      {/* PageHeader */}
      <div className="flex flex-col mb-8">
        <Skeleton className="h-3 w-44 mb-4" />
        <Skeleton className="h-9 w-40 mb-1" />
        <div className="pl-3 border-l-2 border-border/30">
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
      </div>

      <div className="mt-6 space-y-6 w-full">
        {/* ShoppingCartView header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>

        {/* Stats 2-col grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>

        {/* Store groups */}
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3">
              {/* Store header */}
              <div className="flex items-center gap-3 px-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="h-px flex-1 bg-border-dim" />
                <Skeleton className="h-3 w-14" />
              </div>

              {/* Items card */}
              <div className="bg-surface border border-border rounded-2xl divide-y divide-border/50 overflow-hidden">
                {Array.from({ length: i === 0 ? 4 : 3 }).map((_, j) => (
                  <div key={j} className="flex items-center px-4 py-3 gap-3">
                    <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Skeleton className="h-4 w-40" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
