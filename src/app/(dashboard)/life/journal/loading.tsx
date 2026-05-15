import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      {/* Date bar */}
      <div className="flex items-center justify-between bg-surface border border-border p-3 md:p-4 rounded-xl">
        <Skeleton className="h-8 w-44 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl w-full sm:w-auto self-start">
        {["Morning", "Habits", "Tasks", "Evening"].map((t) => (
          <Skeleton key={t} className="h-8 w-24 rounded-lg" />
        ))}
      </div>

      {/* Sleep + Energy grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep card */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
          <Skeleton className="h-9 rounded-xl" />
        </div>
        {/* Energy card */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <Skeleton className="h-9 rounded-xl" />
        </div>
      </div>

      {/* Body metrics bar */}
      <div className="bg-surface border border-border rounded-xl px-5 py-4 flex items-center gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>

      {/* Emotions */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Routine cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-9 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-10 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reflection */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
