import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="px-8 py-8">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-24 mb-6" />
      
      <div className="flex flex-col gap-8">
        {/* Header Area */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            {/* View/Action Area */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
             {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
          <div className="space-y-6">
             <Skeleton className="h-64 w-full rounded-2xl" />
             <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
