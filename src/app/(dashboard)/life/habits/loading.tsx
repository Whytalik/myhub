import { Skeleton } from "@/components/ui/display/skeleton";

export default function HabitsLoading() {
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
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} >
            <div >
              <div >
                <Skeleton />
                <div >
                  <Skeleton />
                  <Skeleton />
                </div>
              </div>
              <div >
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </div>
            </div>

            <div >
              {[0, 1].map((j) => (
                <div key={j} >
                  <Skeleton />
                  <div >
                    <Skeleton />
                    <Skeleton />
                  </div>
                </div>
              ))}
            </div>

            <Skeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
