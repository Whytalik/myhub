import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-8 py-8 space-y-8">
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3 max-w-xl">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px] space-y-5">
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-10 w-16 rounded-xl" />
              <Skeleton className="h-10 w-16 rounded-xl" />
              <Skeleton className="h-10 w-16 rounded-xl" />
              <Skeleton className="h-10 w-16 rounded-xl" />
              <Skeleton className="h-10 w-16 rounded-xl" />
              <Skeleton className="h-10 w-16 rounded-xl" />
              <Skeleton className="h-10 w-16 rounded-xl" />
            </div>

            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-4 rounded-3xl border border-border bg-surface p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
