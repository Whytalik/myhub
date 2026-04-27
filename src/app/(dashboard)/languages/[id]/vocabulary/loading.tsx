import { Skeleton } from "@/components/ui/skeleton";

export default function LanguageVocabularyLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
