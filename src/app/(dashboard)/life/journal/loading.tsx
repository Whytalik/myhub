import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* PageHeader + History button */}
      <div className="relative">
        <div className="flex flex-col mb-8">
          <Skeleton className="h-3 w-40 mb-4" />
          <Skeleton className="h-9 w-44 mb-1" />
          <div className="pl-3 border-l-2 border-border/30">
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
        </div>
        <Skeleton className="absolute top-0 right-0 h-8 w-24 rounded-xl" />
      </div>

      {/* Date bar */}
      <div className="flex items-center justify-between bg-surface border border-border p-3 md:p-4 rounded-xl">
        <Skeleton className="h-8 w-44 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl self-start">
        {["Morning", "Habits", "Tasks", "Evening"].map((t) => (
          <Skeleton key={t} className="h-8 w-24 rounded-lg" />
        ))}
      </div>

      {/* Sleep + Energy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-9 rounded-xl" />
        </div>
      </div>

      {/* Body metrics */}
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

      {/* Routine */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
