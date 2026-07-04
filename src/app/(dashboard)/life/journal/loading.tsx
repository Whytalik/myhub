import { Skeleton } from "@/components/ui/display/skeleton";

export default function JournalLoading() {
  return (
    <div >
      {}
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
      </div>

      {}
      <div >
        <Skeleton />
        <Skeleton />
      </div>

      {}
      <div >
        {["Morning", "Habits", "Tasks", "Evening"].map((t) => (
          <Skeleton key={t} />
        ))}
      </div>

      {}
      <div >
        <div >
          <div >
            <Skeleton />
            <Skeleton />
          </div>
          <div >
            <Skeleton />
            <Skeleton />
          </div>
          <div >
            <Skeleton />
            <Skeleton />
          </div>
          <Skeleton />
        </div>
        <div >
          <div >
            <Skeleton />
            <Skeleton />
          </div>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>

      {}
      <div >
        <Skeleton />
        <Skeleton />
      </div>

      {}
      <div >
        <div >
          <Skeleton />
          <Skeleton />
        </div>
        <div >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>

      {}
      <div >
        <div >
          <div >
            <Skeleton />
            <Skeleton />
          </div>
          <Skeleton />
        </div>
        <Skeleton />
        <div >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
