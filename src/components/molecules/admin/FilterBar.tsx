import { SearchField } from "@/components/molecules/admin/SearchField";
import { cn } from "@/lib/cn";

export type FilterOption = { value: string; label: string };

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  onClear,
  clearLabel,
  className,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    id: string;
    value: string;
    options: FilterOption[];
    onChange: (v: string) => void;
    "aria-label"?: string;
  }>;
  onClear?: () => void;
  clearLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center",
        className,
      )}
    >
      {onSearchChange ? (
        <SearchField
          value={search ?? ""}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="flex-1"
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        {(filters ?? []).map((f) => (
          <select
            key={f.id}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            aria-label={f["aria-label"]}
            className="min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-ink"
          >
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 rounded-xl px-3 text-sm font-medium text-ink-muted hover:bg-black/[0.04] hover:text-ink"
          >
            {clearLabel ?? "Clear"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
