import { skeletonPulse } from "@/styles/ui";
import { cn } from "@/lib/cn";

export function PageSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-md space-y-3 py-10", className)}
      aria-hidden
    >
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(skeletonPulse, "h-10 w-full", i === 0 && "w-2/3")}
        />
      ))}
    </div>
  );
}
