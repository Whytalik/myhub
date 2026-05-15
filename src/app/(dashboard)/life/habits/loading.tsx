import { Skeleton } from "@/components/ui/skeleton";

export default function HabitsLoading() {
  return (
    <div className="px-8 py-8 flex flex-col gap-8">
      {/* PageHeader */}
      <div className="flex flex-col mb-0">
        <Skeleton className="h-3 w-40 mb-4" />
        <Skeleton className="h-9 w-44 mb-1" />
        <div className="pl-3 border-l-2 border-border/30">
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
      </div>

      {/* Habit cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {[0, 1].map((j) => (
                <div key={j} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className={`h-4 ${j === 0 ? "w-full" : "w-4/5"}`} />
                  </div>
                </div>
              ))}
            </div>

            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
