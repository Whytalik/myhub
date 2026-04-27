import { Skeleton } from "@/components/ui/skeleton";

export default function CompassLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="flex flex-col mb-16">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-2/3 max-w-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border p-8 rounded-3xl">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
