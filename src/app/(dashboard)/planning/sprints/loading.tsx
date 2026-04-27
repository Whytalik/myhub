import { Skeleton } from "@/components/ui/skeleton";

export default function SprintsLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="flex justify-between items-start mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
