import { Skeleton } from "@/components/ui/skeleton";

export default function VocabularyLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10 space-y-6">
      <Skeleton className="h-4 w-48 rounded-xl" />
      <Skeleton className="h-8 w-64 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
