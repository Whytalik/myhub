import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="px-8 py-8 flex flex-col gap-8">
      {/* Breadcrumb */}
      <Skeleton className="h-3.5 w-32" />

      {/* Header + controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-3.5 w-80" />
          </div>

          {/* View switcher + buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl">
              {["Gallery", "Calendar", "Timeline", "Graph"].map((v) => (
                <Skeleton key={v} className="h-8 w-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Task list — gallery view (TaskTree) */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: 4 }).map((_, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-2">
            {/* Sphere group header */}
            <div className="flex items-center gap-3 px-1 py-2">
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-10 rounded-full" />
            </div>
            {/* Task rows */}
            <div className="flex flex-col gap-1.5 pl-4">
              {Array.from({ length: groupIdx === 0 ? 4 : groupIdx === 1 ? 3 : 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3">
                  <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                  <Skeleton className={`h-4 ${i % 3 === 0 ? "w-56" : i % 3 === 1 ? "w-44" : "w-36"}`} />
                  <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
