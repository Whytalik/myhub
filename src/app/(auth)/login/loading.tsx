import { Skeleton } from "@/components/ui/display/skeleton";

export default function LoginLoading() {
  return (
    <div >
      <div >
        <div >
          <Skeleton />
          <Skeleton />
        </div>

        <div >
          <Skeleton />
          <Skeleton />

          <div >
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

          <Skeleton />
        </div>
      </div>
    </div>
  );
}
