import { Skeleton } from "@/components/ui/skeleton";

export default function DishesLoading() {
  return (
    <div className="px-8 py-8">
      {/* PageHeader */}
      <div className="flex flex-col mb-8">
        <Skeleton className="h-3 w-44 mb-4" />
        <Skeleton className="h-9 w-32 mb-1" />
        <div className="pl-3 border-l-2 border-border/30">
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2 mb-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
