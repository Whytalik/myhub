export function Skeleton({ className = "" }: { className?: string }) {
  const skeletonClass = `animate-pulse bg-white/[0.06] rounded-lg ${className}`;

  return <div className={skeletonClass} />;
}

export function SkeletonList({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  const wrapperClass = `flex flex-col gap-3 ${className}`;

  return (
    <div className={wrapperClass}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}
