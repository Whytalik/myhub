import { Skeleton } from "@/components/ui/skeleton";

export default function LanguageDetailLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-6">
          <Skeleton className="w-16 h-16 rounded-[24px]" />
          <div>
            <Skeleton className="h-12 w-64 mb-2" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col gap-12">
          <div className="bg-surface/60 border border-border/40 p-10 rounded-[40px]">
            <div className="flex items-center gap-4 mb-10">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <Skeleton className="h-7 w-40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-5 bg-raised/40 rounded-2xl border border-border/30">
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface/30 border border-border/30 rounded-[32px] p-8">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <Skeleton className="h-64 w-full rounded-[40px]" />
          <div className="bg-surface/50 border border-border/40 p-8 rounded-[40px]">
            <div className="flex items-center gap-4 mb-10">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <Skeleton className="h-7 w-24" />
            </div>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-end border-b border-border/20 pb-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
