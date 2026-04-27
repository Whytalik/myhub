import { Skeleton } from "@/components/ui/skeleton";

export default function TradingLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="h-10 w-44 mb-2" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      <Skeleton className="h-4 w-full max-w-3xl mb-10" />

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8">
        <Skeleton className="h-5 w-40 mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
