import { cn } from "@/lib/cn";

export function ErrorBanner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger",
        className,
      )}
    >
      {children}
    </div>
  );
}
