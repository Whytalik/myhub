import { Skeleton } from "@/components/ui/skeleton";

export default function HabitsLoading() {
  return (
    <div className="px-8 py-8">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-24 mb-6" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Filter/Title Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
        <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-40" />
        </div>
      </div>

      {/* Habit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
