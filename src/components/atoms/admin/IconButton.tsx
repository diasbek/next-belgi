import { cn } from "@/lib/cn";

export function IconButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
