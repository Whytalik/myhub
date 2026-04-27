import { Skeleton } from "@/components/ui/skeleton";

export default function LanguagesLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-3 w-32 mb-2" />
      <Skeleton className="h-12 w-60 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />

      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-4 w-20 px-2 py-0.5 rounded border border-border/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {[1, 2].map((i) => (
          <div key={i} className="bg-surface border border-border p-8 rounded-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="w-[120px] h-[120px] rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}
