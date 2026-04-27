import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-7 w-24" />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          <Skeleton className="h-7 w-20 mb-2" />
          <Skeleton className="h-4 w-40 mb-8" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <Skeleton className="h-10 w-full rounded-xl mt-1" />
          </div>

          <Skeleton className="h-3 w-48 mx-auto mt-6" />
        </div>
      </div>
    </div>
  );
}
