import { Skeleton } from "@/components/ui/display/skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas">
      <div className="w-full max-w-[380px] px-4">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>

        <div className="glass-card p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-14 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
