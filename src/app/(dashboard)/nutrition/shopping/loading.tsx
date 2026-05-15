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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="px-6 py-4 border-b border-border/50 last:border-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <Skeleton className="h-6 w-24 mb-6" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
