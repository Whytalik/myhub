import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-48 mb-8" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
           <Skeleton className="h-12 w-full rounded-xl" />
           <Skeleton className="h-12 w-full rounded-xl" />
           <Skeleton className="h-12 w-full rounded-xl" />
           <Skeleton className="h-12 w-full rounded-xl" />
           <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
           <Skeleton className="h-64 w-full rounded-2xl" />
           <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
