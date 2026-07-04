import { Skeleton } from "@/components/ui/display/skeleton";

export default function WeekTemplateLoading() {
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
      <div >
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} >
            <div >
              <Skeleton />
              <Skeleton />
            </div>
            <div >
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} >
                  <Skeleton />
                  <Skeleton />
                </div>
              ))}
            </div>
            <Skeleton />
          </div>
        ))}
      </div>

      {}
      <div >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} >
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
