import { Skeleton } from "@/components/ui/skeleton";

export default function WeekLoading() {
  return (
    <div className="px-8 py-8">
      {/* PageHeader */}
      <div className="flex flex-col mb-8">
        <Skeleton className="h-3 w-56 mb-4" />
        <Skeleton className="h-9 w-48 mb-1" />
        <div className="pl-3 border-l-2 border-border/30">
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
      </div>

      {/* WeekSummary */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* WeekPlanner — day columns */}
      <div className="space-y-4">
        {/* Day selector tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <Skeleton key={d} className="h-9 w-14 rounded-xl shrink-0" />
          ))}
        </div>

        {/* Day plan */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {/* Day header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-raised/30">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>

          {/* Meal slots */}
          <div className="divide-y divide-border/40">
            {["Breakfast", "Lunch", "Dinner", "Snack"].map((meal) => (
              <div key={meal} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
                <div className="space-y-2 pl-7">
                  {Array.from({ length: meal === "Dinner" ? 3 : 2 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                      <Skeleton className={`h-4 ${j === 0 ? "w-40" : "w-32"}`} />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-3.5 w-12" />
                        <Skeleton className="h-3.5 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
