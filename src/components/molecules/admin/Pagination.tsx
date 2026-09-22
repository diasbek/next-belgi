import { cn } from "@/lib/cn";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  shownLabel,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  shownLabel: string;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
  const label = shownLabel
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(total));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-xs text-ink-muted sm:px-5",
        className,
      )}
    >
      <p className="m-0">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
          className="min-h-9 rounded-lg px-3 font-medium text-ink disabled:opacity-40 hover:bg-black/[0.04]"
        >
          ‹
        </button>
        <span className="tabular-nums">
          {current} / {totalPages}
        </span>
        <button
          type="button"
          disabled={current >= totalPages}
          onClick={() => onPageChange(current + 1)}
          className="min-h-9 rounded-lg px-3 font-medium text-ink disabled:opacity-40 hover:bg-black/[0.04]"
        >
          ›
        </button>
      </div>
    </div>
  );
}
