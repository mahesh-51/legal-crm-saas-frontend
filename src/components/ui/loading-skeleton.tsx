import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type?: "table" | "card" | "form" | "list";
  rows?: number;
}

export function LoadingSkeleton({ type = "table", rows = 5 }: LoadingSkeletonProps) {
  if (type === "table") {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
