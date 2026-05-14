import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="w-full">
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

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="border-b border-border px-6 py-4 bg-raised/30">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-24" />)}
          </div>
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="px-6 py-4 border-b border-border/50 last:border-0">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <div className="flex gap-2 justify-end">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
