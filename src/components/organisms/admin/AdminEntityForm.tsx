import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/admin/Spinner";
import { cn } from "@/lib/cn";

export function AdminEntityForm({
  children,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  busy,
  className,
}: {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  className?: string;
}) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      {children}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={busy} className="min-w-[7rem]">
          {busy ? <Spinner className="border-white/30 border-t-white" /> : submitLabel}
        </Button>
        {onCancel && cancelLabel ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
