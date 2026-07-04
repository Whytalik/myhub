import { Skeleton } from "@/components/ui/display/skeleton";

export default function ReviewLoading() {
  return (
    <div >
      {}
      <div >
        <Skeleton />
        <Skeleton />
        <div >
          <Skeleton />
        </div>
        <div />
      </div>

      {}
      <Skeleton />

      {}
      <Skeleton />

      {}
      <div >
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    </div>
  );
}
