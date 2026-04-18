import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="px-14 py-10">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex justify-between items-start mb-12">
        <Skeleton className="h-14 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border px-4 py-3 bg-raised/30">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-3 flex-1" />)}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-4 border-b border-border/50">
            <div className="flex gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
