import { Skeleton } from "@/components/ui/display/skeleton";

export default function HistoryLoading() {
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
        {["All", "Weeks", "Months", "Quarters", "Years"].map((t) => (
          <Skeleton key={t} />
        ))}
      </div>

      {}
      <div >
        {Array.from({ length: 2 }).map((_, groupIdx) => (
          <div key={groupIdx} >
            <div >
              <div />
              <Skeleton />
              <div />
            </div>

            <div >
              {Array.from({ length: groupIdx === 0 ? 5 : 3 }).map((_, i) => (
                <div key={i} >
                  <Skeleton />
                  <div >
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </div>
                  <Skeleton />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
