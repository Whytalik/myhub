import { Skeleton } from "@/components/ui/display/skeleton";

export default function TasksLoading() {
  return (
    <div >
      {}
      <Skeleton />

      {}
      <div >
        <div >
          <div >
            <Skeleton />
            <Skeleton />
          </div>

          {}
          <div >
            <div >
              {["Gallery", "Calendar", "Timeline", "Graph"].map((v) => (
                <Skeleton key={v} />
              ))}
            </div>
            <Skeleton />
            <Skeleton />
          </div>
        </div>
      </div>

      {}
      <div >
        {Array.from({ length: 4 }).map((_, groupIdx) => (
          <div key={groupIdx} >
            {}
            <div >
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
            {}
            <div >
              {Array.from({ length: groupIdx === 0 ? 4 : groupIdx === 1 ? 3 : 2 }).map((_, i) => (
                <div key={i} >
                  <Skeleton />
                  <Skeleton />
                  <div >
                    <Skeleton />
                    <Skeleton />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
