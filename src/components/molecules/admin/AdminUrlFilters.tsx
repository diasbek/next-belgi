"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FilterBar,
  type FilterOption,
} from "@/components/molecules/admin/FilterBar";
import { Pagination } from "@/components/molecules/admin/Pagination";

export function AdminUrlFilters({
  searchPlaceholder,
  clearLabel,
  statusOptions,
  statusParam = "status",
  reasonOptions,
  reasonParam = "reason",
  extraFilters,
}: {
  searchPlaceholder?: string;
  clearLabel?: string;
  statusOptions?: FilterOption[];
  statusParam?: string;
  reasonOptions?: FilterOption[];
  reasonParam?: string;
  extraFilters?: Array<{
    id: string;
    options: FilterOption[];
    "aria-label"?: string;
    /** Shown when URL param is absent */
    defaultValue?: string;
  }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get(statusParam) ?? "";
  const reason = searchParams.get(reasonParam) ?? "";

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router, searchParams],
  );

  const filters = [
    ...(statusOptions
      ? [
          {
            id: statusParam,
            value: status,
            options: statusOptions,
            onChange: (v: string) => push({ [statusParam]: v || null }),
            "aria-label": statusParam,
          },
        ]
      : []),
    ...(reasonOptions
      ? [
          {
            id: reasonParam,
            value: reason,
            options: reasonOptions,
            onChange: (v: string) => push({ [reasonParam]: v || null }),
            "aria-label": reasonParam,
          },
        ]
      : []),
    ...(extraFilters || []).map((f) => ({
      id: f.id,
      value: searchParams.get(f.id) ?? f.defaultValue ?? "",
      options: f.options,
      onChange: (v: string) => {
        const def = f.defaultValue;
        if (def && v === def) push({ [f.id]: null });
        else push({ [f.id]: v || null });
      },
      "aria-label": f["aria-label"] || f.id,
    })),
  ];

  const extraActive = (extraFilters || []).some((f) => {
    const v = searchParams.get(f.id);
    if (!v) return false;
    if (f.defaultValue && v === f.defaultValue) return false;
    return true;
  });

  return (
    <FilterBar
      search={q}
      onSearchChange={(v) => push({ q: v || null })}
      searchPlaceholder={searchPlaceholder}
      filters={filters}
      onClear={
        q || status || reason || extraActive
          ? () => {
              const patch: Record<string, string | null> = {
                q: null,
                [statusParam]: null,
                [reasonParam]: null,
              };
              for (const f of extraFilters || []) patch[f.id] = null;
              push(patch);
            }
          : undefined
      }
      clearLabel={clearLabel}
    />
  );
}

export function AdminPageLink({
  page,
  shownLabel,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
  shownLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      total={total}
      shownLabel={shownLabel}
      onPageChange={(nextPage) => {
        const next = new URLSearchParams(searchParams.toString());
        if (nextPage <= 1) next.delete("page");
        else next.set("page", String(nextPage));
        const qs = next.toString();
        startTransition(() => {
          router.push(qs ? `${pathname}?${qs}` : pathname);
        });
      }}
    />
  );
}
