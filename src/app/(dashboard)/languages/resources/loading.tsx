import { Skeleton } from "@/components/ui/skeleton";

export default function LanguagesResourcesLoading() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10 space-y-6">
      <Skeleton className="h-4 w-48 rounded-xl" />
      <Skeleton className="h-8 w-64 rounded-xl" />
      <Skeleton className="h-32 w-full rounded-3xl" />
      <Skeleton className="h-32 w-full rounded-3xl" />
      <Skeleton className="h-32 w-full rounded-3xl" />
    </div>
  );
}
