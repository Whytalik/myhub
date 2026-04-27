import { Skeleton } from "@/components/ui/skeleton";

export default function VocabularyLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
