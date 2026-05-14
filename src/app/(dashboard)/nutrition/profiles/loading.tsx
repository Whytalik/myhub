import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilesLoading() {
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="bg-raised/50 px-6 py-4 border-b border-border flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
              <div className="p-6 space-y-6">
                <div className="max-w-[200px] space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border/30 flex items-center gap-4">
                  <Skeleton className="flex-1 h-1.5 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
