import { Skeleton } from "@/components/ui/skeleton";

export default function ExercisesLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Skeleton className="h-4 w-24 mb-6" />
      <Skeleton className="h-8 w-32 mb-4" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}
