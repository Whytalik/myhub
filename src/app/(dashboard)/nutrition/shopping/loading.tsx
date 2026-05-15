import { Skeleton } from "@/components/ui/skeleton";

export default function ShoppingLoading() {
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="h-px w-full bg-border-dim mt-4 mb-3" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {[1, 2, 3].map((j) => (
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
              <div className="h-px bg-border-dim" />
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
