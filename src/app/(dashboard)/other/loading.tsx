import { Skeleton } from "@/components/ui/skeleton";

export default function OtherLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-3 w-28 mb-2" />
      <Skeleton className="h-12 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="bg-surface border border-border rounded-xl p-6 mb-20">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>

      <div className="bg-surface/50 border border-border-dim border-dashed rounded-2xl p-10 flex flex-col items-center text-center gap-4">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
