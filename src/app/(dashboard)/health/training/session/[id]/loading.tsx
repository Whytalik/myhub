import { Skeleton, SkeletonList } from "@/components/ui/display/skeleton";

export default function TrainingSessionLoading() {
  return (
    <div >
      <div >
        <Skeleton />
        <Skeleton />
        <div >
          <Skeleton />
        </div>
        <div />
      </div>

      <SkeletonList rows={5} />
    </div>
  );
}
