import { Skeleton } from "@/components/ui/skeleton";

export default function WeekLoading() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="h-px w-full bg-border-dim mt-4 mb-3" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="mb-6">
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="bg-raised/50 px-5 py-3 border-b border-border">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-8 divide-x divide-border/50">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3 min-w-0 pl-4 first:pl-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-lg" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="space-y-1.5">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-4" />
                        <Skeleton className="flex-1 h-1.5 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-10 w-16 rounded-xl shrink-0" />
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="bg-raised/50 px-5 py-3 border-b border-border">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-md" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-1">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-1 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {[1, 2].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-raised/10">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-32 rounded-xl" />
                <Skeleton className="h-8 w-32 rounded-xl" />
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-6 w-20 rounded-lg" />
                </div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="grid grid-cols-[1fr_1fr_1fr] border-b border-border/20 last:border-b-0">
                    <div className="px-4 py-2"><Skeleton className="h-4 w-24" /></div>
                    <div className="px-4 py-2 border-l border-border/20"><Skeleton className="h-4 w-12" /></div>
                    <div className="px-4 py-2 border-l border-border/20"><Skeleton className="h-4 w-12" /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
