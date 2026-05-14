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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-1">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="flex gap-3 mb-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="pt-3 border-t border-border/50">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
