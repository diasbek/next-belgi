import { cn } from "@/lib/cn";

function buildPageItems(
  current: number,
  totalPages: number,
  siblingCount = 1,
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return [1];

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (
    let p = current - siblingCount;
    p <= current + siblingCount;
    p += 1
  ) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  // Near edges, show a bit more so the window doesn't feel empty.
  if (current <= 3) {
    for (let p = 2; p <= Math.min(4, totalPages); p += 1) pages.add(p);
  }
  if (current >= totalPages - 2) {
    for (let p = Math.max(1, totalPages - 3); p < totalPages; p += 1) {
      pages.add(p);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) items.push("ellipsis");
    items.push(p);
    prev = p;
  }
  return items;
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
  "aria-label": ariaLabel,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium tabular-nums transition-colors",
        active
          ? "bg-lime text-ink"
          : "text-ink hover:bg-black/[0.04] disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const current = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
  const label = shownLabel
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(total));

  const items = buildPageItems(current, totalPages, 1);

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-xs text-ink-muted sm:px-5",
          className,
        )}
      >
        <p className="m-0">{label}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-xs text-ink-muted sm:px-5",
        className,
      )}
    >
      <p className="m-0">{label}</p>
      <nav
        className="flex flex-wrap items-center gap-0.5"
        aria-label="Pagination"
      >
        <PageButton
          disabled={current <= 1}
          aria-label="First page"
          onClick={() => onPageChange(1)}
          className="hidden sm:inline-flex"
        >
          «
        </PageButton>
        <PageButton
          disabled={current <= 1}
          aria-label="Previous page"
          onClick={() => onPageChange(current - 1)}
        >
          ‹
        </PageButton>

        {items.map((item, i) =>
          item === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="inline-flex min-h-9 min-w-7 items-center justify-center text-ink-muted"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              active={item === current}
              aria-label={`Page ${item}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PageButton>
          ),
        )}

        <PageButton
          disabled={current >= totalPages}
          aria-label="Next page"
          onClick={() => onPageChange(current + 1)}
        >
          ›
        </PageButton>
        <PageButton
          disabled={current >= totalPages}
          aria-label="Last page"
          onClick={() => onPageChange(totalPages)}
          className="hidden sm:inline-flex"
        >
          »
        </PageButton>
      </nav>
    </div>
  );
}
