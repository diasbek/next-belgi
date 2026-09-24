"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { DashPanel } from "@/components/molecules/DashChrome";
import { IconSearch } from "@/components/atoms/DashIcons";
import { HistoryPdfButton } from "@/components/pdf/conclusion/HistoryPdfButton";
import { cn } from "@/lib/cn";

export type HistoryCheckRow = {
  id: string;
  query: string;
  created_at: string;
  nice_classes: unknown;
};

function formatClasses(raw: unknown, emptyLabel: string): string {
  if (!Array.isArray(raw) || raw.length === 0) return emptyLabel;
  const parts: string[] = [];
  for (const item of raw) {
    if (typeof item === "number" || typeof item === "string") {
      parts.push(String(item));
      continue;
    }
    if (item && typeof item === "object") {
      const rec = item as Record<string, unknown>;
      if (typeof rec.classNumber === "number") {
        parts.push(String(rec.classNumber));
        continue;
      }
      if (typeof rec.label === "string" && rec.label.trim()) {
        parts.push(rec.label.trim());
      }
    }
  }
  return parts.length ? parts.slice(0, 8).join(", ") : emptyLabel;
}

function formatDateParts(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  // UTC — identical on SSR and client (avoids React #418 hydration mismatch).
  const date = `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  return { date, time };
}

function classOptionValues(checks: HistoryCheckRow[]): string[] {
  const set = new Set<string>();
  for (const c of checks) {
    if (!Array.isArray(c.nice_classes)) continue;
    for (const item of c.nice_classes) {
      if (typeof item === "number" || typeof item === "string") {
        const s = String(item).trim();
        if (s) set.add(s);
        continue;
      }
      if (item && typeof item === "object") {
        const n = (item as { classNumber?: unknown }).classNumber;
        if (typeof n === "number") set.add(String(n));
      }
    }
  }
  return [...set].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
}

export function AccountHistoryTable({
  locale,
  checks,
}: {
  locale: Locale;
  checks: HistoryCheckRow[];
}) {
  const copy = getAppCopy(locale);
  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [nowMs] = useState(() => Date.now());
  const pageSize = 25;

  const classOptions = useMemo(() => classOptionValues(checks), [checks]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return checks.filter((c) => {
      if (query && !c.query.toLowerCase().includes(query)) return false;
      if (classFilter !== "all") {
        const classes = classOptionValues([c]);
        if (!classes.includes(classFilter)) return false;
      }
      if (dateFilter !== "all") {
        const age = nowMs - new Date(c.created_at).getTime();
        const day = 86_400_000;
        if (dateFilter === "7d" && age > 7 * day) return false;
        if (dateFilter === "30d" && age > 30 * day) return false;
      }
      return true;
    });
  }, [checks, q, classFilter, dateFilter, nowMs]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const filterKey = `${q}|${classFilter}|${dateFilter}`;
  const [pageFilterKey, setPageFilterKey] = useState(filterKey);
  if (filterKey !== pageFilterKey) {
    setPageFilterKey(filterKey);
    setPage(1);
  }
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  if (!checks.length) {
    return (
      <DashPanel className="px-5 py-10 text-center text-sm text-ink-muted">
        {copy.history.empty}
      </DashPanel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted">
            <IconSearch />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={copy.history.searchPlaceholder}
            className="min-h-11 w-full rounded-xl border border-black/10 bg-white py-2.5 pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary/30"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-ink"
          >
            <option value="all">{copy.history.filterClasses}</option>
            {classOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-ink"
          >
            <option value="all">{copy.history.allDates}</option>
            <option value="7d">{copy.history.last7Days}</option>
            <option value="30d">{copy.history.last30Days}</option>
          </select>
        </div>
      </div>

      <DashPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs text-ink-muted">
                <th className="px-4 py-3 font-medium sm:px-5">
                  {copy.history.query}
                </th>
                <th className="px-4 py-3 font-medium sm:px-5">
                  {copy.history.classes}
                </th>
                <th className="px-4 py-3 font-medium sm:px-5">
                  {copy.history.date}
                </th>
                <th className="px-4 py-3 font-medium sm:px-5">
                  {copy.history.report}
                </th>
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-ink-muted sm:px-5"
                  >
                    {copy.history.emptyFilter}
                  </td>
                </tr>
              ) : (
                pageRows.map((c) => {
                const letter = (c.query.trim().charAt(0) || "?").toUpperCase();
                const { date, time } = formatDateParts(c.created_at);
                const classes = formatClasses(
                  c.nice_classes,
                  copy.history.noClasses,
                );
                const reportHref = `${localePath(locale, "/account/check/result/")}?${new URLSearchParams({ checkId: c.id, q: c.query }).toString()}`;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-sm font-semibold text-ink/70">
                          {letter}
                        </span>
                        <span className="font-medium text-ink">{c.query}</span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 sm:px-5",
                        classes === copy.history.noClasses
                          ? "text-ink-muted"
                          : "text-ink",
                      )}
                    >
                      {classes}
                    </td>
                    <td className="px-4 py-3.5 sm:px-5" suppressHydrationWarning>
                      <span className="block text-ink">{date}</span>
                      <span className="block text-xs text-ink-muted">{time}</span>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <Link
                        href={reportHref}
                        className="inline-flex items-center gap-1 font-medium text-ink underline-offset-2 hover:underline"
                      >
                        {copy.history.openReport}
                        <span aria-hidden>↗</span>
                      </Link>
                      <HistoryPdfButton locale={locale} checkId={c.id} />
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-xs text-ink-muted sm:px-5">
          <p className="m-0">
            {copy.history.shownOf
              .replace(`{shown}`, String(pageRows.length))
              .replace(`{total}`, String(filtered.length))}
          </p>
          {pageCount > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border px-2.5 py-1.5 disabled:opacity-40"
              >
                ‹
              </button>
              <span>
                {page} / {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-lg border border-border px-2.5 py-1.5 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </DashPanel>

      <p className="flex items-start gap-2 text-xs text-ink-muted">
        <span
          className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink-muted/40 text-[0.65rem]"
          aria-hidden
        >
          i
        </span>
        <span>{copy.history.classesHint}</span>
      </p>
    </div>
  );
}
