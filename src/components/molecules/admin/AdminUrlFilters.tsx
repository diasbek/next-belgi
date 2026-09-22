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
}: {
  searchPlaceholder?: string;
  clearLabel?: string;
  statusOptions?: FilterOption[];
  statusParam?: string;
  reasonOptions?: FilterOption[];
  reasonParam?: string;
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
  ];

  return (
    <FilterBar
      search={q}
      onSearchChange={(v) => push({ q: v || null })}
      searchPlaceholder={searchPlaceholder}
      filters={filters}
      onClear={
        q || status || reason
          ? () =>
              push({
                q: null,
                [statusParam]: null,
                [reasonParam]: null,
              })
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
