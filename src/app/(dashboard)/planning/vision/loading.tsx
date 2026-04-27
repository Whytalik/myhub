import { Skeleton } from "@/components/ui/skeleton";

export default function VisionLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex flex-col mb-16">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-2/3 max-w-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-12 max-w-4xl">
        <section className="bg-surface border border-border p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-12 border-2 border-dashed border-border/40 rounded-2xl">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </section>

        <section className="bg-surface border border-border p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 bg-raised/30 border border-border rounded-xl h-32">
                <Skeleton className="h-3 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
