import { Skeleton } from "@/components/ui/skeleton";

export default function AddLanguageLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="mb-12">
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-2/3 max-w-2xl" />
      </div>

      <div className="bg-surface border border-border rounded-xl p-8">
        <Skeleton className="h-3 w-40 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-raised border border-border rounded-lg p-4 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
