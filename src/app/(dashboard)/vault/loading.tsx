import { Skeleton } from "@/components/ui/skeleton";

export default function VaultLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      <Skeleton className="h-4 w-full max-w-3xl mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
