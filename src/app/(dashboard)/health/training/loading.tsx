import { Skeleton, SkeletonList } from "@/components/ui/display/skeleton";

export default function TrainingLoading() {
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

      <Skeleton />
      <SkeletonList rows={4} />
    </div>
  );
}
