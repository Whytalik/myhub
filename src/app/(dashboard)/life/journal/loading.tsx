import { Skeleton } from "@/components/ui/display/skeleton";

export default function JournalLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3 pb-6 mb-6 border-b border-white/[0.06] flex-1">
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-6 w-56 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {["Morning", "Habits", "Tasks", "Evening"].map((t) => (
          <Skeleton key={t} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="glass-card p-4 flex flex-col gap-4">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>

      <div className="glass-card p-4 flex items-center gap-3">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <Skeleton className="h-3 w-32 rounded" />
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}
