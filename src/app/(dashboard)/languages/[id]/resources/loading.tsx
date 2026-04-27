import { Skeleton } from "@/components/ui/skeleton";

export default function LanguageResourcesLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex items-center gap-5 mb-12">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6">
            <Skeleton className="h-5 w-40 mb-3" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
