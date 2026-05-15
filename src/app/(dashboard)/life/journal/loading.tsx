import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="px-8 py-8 flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      {/* Main Journal Form Area */}
      <div className="bg-surface border border-border rounded-2xl p-8 space-y-12">
          {/* Sleep/Energy Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          
          {/* Emotions/Routine/Reflection */}
          <div className="space-y-8">
             <Skeleton className="h-20 w-full rounded-xl" />
             <Skeleton className="h-32 w-full rounded-xl" />
          </div>
      </div>
    </div>
  );
}
