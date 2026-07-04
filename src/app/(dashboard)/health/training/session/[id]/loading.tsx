import { Skeleton, SkeletonList } from "@/components/ui/skeleton";

export default function TrainingSessionLoading() {
  return (
    <div className="px-8 py-8 flex flex-col gap-8">
      <div className="flex flex-col mb-0">
        <Skeleton className="h-3 w-40 mb-4" />
        <Skeleton className="h-9 w-44 mb-1" />
        <div className="pl-3 border-l-2 border-border/30">
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
      </div>

      <SkeletonList rows={5} />
    </div>
  );
}
