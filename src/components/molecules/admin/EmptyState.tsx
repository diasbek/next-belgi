import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  lead,
  actionLabel,
  onAction,
  actionHref,
  className,
}: {
  title: string;
  lead?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("px-5 py-12 text-center", className)}>
      <p className="m-0 text-base font-semibold text-ink">{title}</p>
      {lead ? (
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{lead}</p>
      ) : null}
      {actionLabel && (onAction || actionHref) ? (
        <Button
          href={actionHref}
          onClick={onAction}
          className="mt-5"
          variant="secondary"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
