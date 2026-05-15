import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="px-8 py-8 flex flex-col gap-8">
      {/* Breadcrumb */}
      <Skeleton className="h-3.5 w-52" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl self-start">
        {["All", "Weeks", "Months", "Quarters", "Years"].map((t) => (
          <Skeleton key={t} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-12">
        {Array.from({ length: 2 }).map((_, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-6">
            {/* Group separator */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/40" />
              <Skeleton className="h-3.5 w-32" />
              <div className="h-px flex-1 bg-border/40" />
            </div>

            {/* Entry rows */}
            <div className="flex flex-col gap-4">
              {Array.from({ length: groupIdx === 0 ? 5 : 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 bg-surface border border-border rounded-xl px-6 py-4">
                  {/* Date */}
                  <Skeleton className="h-5 w-40 shrink-0" />
                  {/* Metric chips */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-12 rounded-md" />
                    <Skeleton className="h-6 w-14 rounded-md" />
                    <Skeleton className="h-6 w-14 rounded-md" />
                    <Skeleton className="h-6 w-12 rounded-md" />
                    <Skeleton className="h-6 w-14 rounded-md" />
                    <Skeleton className="h-6 w-12 rounded-md" />
                  </div>
                  {/* Win quote */}
                  <Skeleton className="ml-auto h-4 w-48 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
