"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { DashPageHeader } from "@/components/molecules/DashChrome";
import { EmptyState } from "@/components/molecules/admin/EmptyState";
import {
  AdminCardList,
  AdminDataTable,
  type AdminColumn,
} from "@/components/organisms/admin/AdminDataTable";
import { AdminDetailDrawer } from "@/components/organisms/admin/AdminDetailDrawer";
import type { TrademarkMatch } from "@/lib/check/types";
import type { IntegrationProvider } from "@/lib/integrations/types";
import { cn } from "@/lib/cn";
import { fieldInput } from "@/styles/ui";

type ExploreCode = "eu" | "us" | "au";

type IntegrationStatus = {
  provider: IntegrationProvider;
  configured: boolean;
  enabled: boolean;
  mode: string;
};

type SearchResponse = {
  ok?: boolean;
  error?: string;
  jurisdiction?: ExploreCode;
  query?: string;
  unavailable?: boolean;
  fetchedAt?: string;
  fromCache?: boolean;
  matches?: TrademarkMatch[];
  meta?: {
    providerId: string | null;
    count: number;
    limit: number;
    niceClasses: number[];
    skipCache: boolean;
  };
};

const OFFICES: {
  code: ExploreCode;
  provider: IntegrationProvider;
  labelKey: "officeEu" | "officeUs" | "officeAu";
}[] = [
  { code: "eu", provider: "euipo", labelKey: "officeEu" },
  { code: "us", provider: "uspto", labelKey: "officeUs" },
  { code: "au", provider: "ipaustralia", labelKey: "officeAu" },
];

const NICE_PRESETS = [1, 3, 5, 9, 25, 35, 41, 42, 43, 45];

function modeBadgeClass(mode: string) {
  if (mode === "live") return "bg-ink text-white";
  if (mode === "sandbox") return "bg-amber-100 text-amber-900";
  if (mode === "dev" || mode === "mock" || mode === "test") {
    return "bg-lime text-ink";
  }
  return "bg-surface-muted text-ink-muted";
}

function SimilarityBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value > 1 ? value : value * 100)));
  return (
    <div className="flex min-w-[5.5rem] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-ink"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="tabular-nums text-xs text-ink-muted">{pct}%</span>
    </div>
  );
}

export function AdminExplorePanel({ locale }: { locale: Locale }) {
  const copy = getAppCopy(locale);
  const c = copy.adminExplore;
  const integrationsHref = localePath(locale, "/admin/integrations/");

  const [statuses, setStatuses] = useState<IntegrationStatus[]>([]);
  const [office, setOffice] = useState<ExploreCode>("eu");
  const [query, setQuery] = useState("");
  const [niceClasses, setNiceClasses] = useState<number[]>([]);
  const [limit, setLimit] = useState(20);
  const [skipCache, setSkipCache] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [selected, setSelected] = useState<TrademarkMatch | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const statusMap = useMemo(() => {
    const m = new Map<IntegrationProvider, IntegrationStatus>();
    for (const s of statuses) m.set(s.provider, s);
    return m;
  }, [statuses]);

  const activeOffice = OFFICES.find((o) => o.code === office)!;
  const activeStatus = statusMap.get(activeOffice.provider);

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/admin/integrations/");
      const json = (await res.json()) as {
        ok?: boolean;
        items?: IntegrationStatus[];
      };
      if (res.ok && json.ok && json.items) setStatuses(json.items);
    } catch {
      /* ignore — search still works */
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadStatus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadStatus]);

  function toggleClass(n: number) {
    setNiceClasses((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b),
    );
  }

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q || busy) return;
    setBusy(true);
    setErr(null);
    setSelected(null);
    setShowRaw(false);
    try {
      const res = await fetch("/api/admin/explore/search/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jurisdiction: office,
          query: q,
          niceClasses: niceClasses.length ? niceClasses : undefined,
          limit,
          skipCache,
        }),
      });
      const json = (await res.json()) as SearchResponse;
      if (!res.ok || !json.ok) {
        setResult(null);
        setErr(json.error || copy.adminUi.error);
        return;
      }
      setResult(json);
    } catch {
      setResult(null);
      setErr(copy.adminUi.error);
    } finally {
      setBusy(false);
    }
  }

  const matches = result?.matches ?? [];

  const columns: AdminColumn<TrademarkMatch>[] = [
    {
      id: "name",
      header: c.colMark,
      cell: (row) => (
        <span className="font-medium text-ink">{row.name || "—"}</span>
      ),
    },
    {
      id: "owner",
      header: c.colOwner,
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-ink-muted">{row.owner || "—"}</span>
      ),
    },
    {
      id: "status",
      header: c.colStatus,
      hideOnMobile: true,
      cell: (row) => row.status || "—",
    },
    {
      id: "classes",
      header: c.colClasses,
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-ink-muted">{row.classesText || "—"}</span>
      ),
    },
    {
      id: "similarity",
      header: c.colSimilarity,
      cell: (row) => <SimilarityBar value={row.similarity} />,
    },
    {
      id: "source",
      header: c.colSource,
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-ink-muted">{row.sourceLabel || "—"}</span>
      ),
    },
  ];

  return (
    <div>
      <DashPageHeader title={c.title} lead={c.lead} />

      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgb(26_28_24/0.04)]">
        <div className="border-b border-black/5 px-4 py-4 sm:px-5">
          <p className="m-0 mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
            {c.officeLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {OFFICES.map((o) => {
              const st = statusMap.get(o.provider);
              const selectedOffice = office === o.code;
              return (
                <button
                  key={o.code}
                  type="button"
                  onClick={() => {
                    setOffice(o.code);
                    setResult(null);
                    setErr(null);
                    setSelected(null);
                  }}
                  className={cn(
                    "flex min-w-[8.5rem] flex-col gap-1.5 rounded-xl border px-3.5 py-3 text-left transition",
                    selectedOffice
                      ? "border-ink bg-ink text-white"
                      : "border-black/10 bg-surface-muted/40 text-ink hover:border-black/20",
                  )}
                >
                  <span className="text-sm font-semibold">{c[o.labelKey]}</span>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      selectedOffice
                        ? "bg-white/15 text-white"
                        : modeBadgeClass(st?.mode || "mock"),
                    )}
                  >
                    {loadingStatus
                      ? "…"
                      : st?.configured
                        ? st.mode
                        : c.notConfiguredBadge}
                  </span>
                </button>
              );
            })}
            <div
              className="flex min-w-[8.5rem] cursor-not-allowed flex-col gap-1.5 rounded-xl border border-dashed border-black/10 px-3.5 py-3 text-left opacity-50"
              title={c.kazDisabled}
            >
              <span className="text-sm font-semibold text-ink-muted">
                {c.officeKz}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                {c.kazDisabled}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={runSearch} className="space-y-4 px-4 py-4 sm:px-5">
          {!loadingStatus && activeStatus && !activeStatus.configured ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="m-0 font-medium">{c.notConfiguredTitle}</p>
              <p className="mt-1 m-0 text-amber-900/80">{c.notConfiguredLead}</p>
              <Link
                href={integrationsHref}
                className="mt-2 inline-block text-sm font-medium text-ink underline-offset-2 hover:underline"
              >
                {c.openIntegrations}
              </Link>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                {c.queryLabel}
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.queryPlaceholder}
                className={fieldInput}
                maxLength={200}
                autoComplete="off"
                required
              />
            </label>
            <label className="block sm:w-24">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                {c.limitLabel}
              </span>
              <input
                type="number"
                min={1}
                max={50}
                value={limit}
                onChange={(e) =>
                  setLimit(
                    Math.min(50, Math.max(1, Number(e.target.value) || 20)),
                  )
                }
                className={fieldInput}
              />
            </label>
            <Button type="submit" disabled={busy || !query.trim()}>
              {busy ? c.searching : c.search}
            </Button>
          </div>

          <div>
            <p className="m-0 mb-1.5 text-xs font-medium text-ink-muted">
              {c.niceClasses}
            </p>
            <p className="m-0 mb-2 text-xs text-ink-muted">{c.niceClassesHint}</p>
            <div className="flex flex-wrap gap-1.5">
              {NICE_PRESETS.map((n) => {
                const on = niceClasses.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleClass(n)}
                    className={cn(
                      "h-8 min-w-8 rounded-lg border px-2 text-xs font-medium tabular-nums transition",
                      on
                        ? "border-ink bg-ink text-white"
                        : "border-black/10 bg-white text-ink-muted hover:border-black/20",
                    )}
                  >
                    {n}
                  </button>
                );
              })}
              {niceClasses.length ? (
                <button
                  type="button"
                  onClick={() => setNiceClasses([])}
                  className="h-8 rounded-lg px-2 text-xs text-ink-muted hover:text-ink"
                >
                  {c.clearClasses}
                </button>
              ) : null}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={skipCache}
              onChange={(e) => setSkipCache(e.target.checked)}
              className="rounded border-black/20"
            />
            {c.skipCache}
          </label>
        </form>

        {err ? (
          <div className="border-t border-black/5 px-4 py-3 text-sm text-red-700 sm:px-5">
            {err}
          </div>
        ) : null}

        {result ? (
          <div className="border-t border-black/5">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
              <p className="m-0 text-sm text-ink-muted">
                {result.unavailable
                  ? c.unavailableTitle
                  : c.resultsCount.replace(
                      "{count}",
                      String(result.meta?.count ?? matches.length),
                    )}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-ink-muted">
                {result.fromCache ? (
                  <span className="rounded-md bg-surface-muted px-1.5 py-0.5">
                    {c.fromCache}
                  </span>
                ) : (
                  <span className="rounded-md bg-lime px-1.5 py-0.5 text-ink">
                    {c.live}
                  </span>
                )}
                {result.fetchedAt ? (
                  <span className="tabular-nums">
                    {new Date(result.fetchedAt).toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>

            {result.unavailable ? (
              <EmptyState title={c.unavailableTitle} lead={c.unavailableLead} />
            ) : matches.length === 0 ? (
              <EmptyState title={c.emptyTitle} lead={c.emptyLead} />
            ) : (
              <>
                <AdminDataTable
                  columns={columns}
                  rows={matches}
                  onRowClick={setSelected}
                  selectedId={selected?.id}
                />
                <AdminCardList
                  rows={matches}
                  selectedId={selected?.id}
                  onRowClick={setSelected}
                  renderCard={(row) => (
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <p className="m-0 font-medium text-ink">{row.name}</p>
                        <SimilarityBar value={row.similarity} />
                      </div>
                      <p className="mt-1 m-0 text-sm text-ink-muted">
                        {row.owner || "—"}
                        {row.status ? ` · ${row.status}` : ""}
                      </p>
                      {row.classesText ? (
                        <p className="mt-1 m-0 text-xs text-ink-muted">
                          {row.classesText}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
              </>
            )}
          </div>
        ) : !busy && !err ? (
          <div className="border-t border-black/5">
            <EmptyState title={c.idleTitle} lead={c.idleLead} />
          </div>
        ) : null}

        {busy ? (
          <div className="border-t border-black/5 px-4 py-10 text-center text-sm text-ink-muted sm:px-5">
            {c.searching}
          </div>
        ) : null}
      </div>

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setShowRaw(false);
          }
        }}
        title={selected?.name || c.detailTitle}
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <dl className="m-0 grid gap-3">
              {(
                [
                  [c.colMark, selected.name],
                  [c.colOwner, selected.owner],
                  [c.colStatus, selected.status],
                  [c.colClasses, selected.classesText],
                  [c.colSource, selected.sourceLabel],
                  ["ID", selected.id],
                  [c.registeredFrom, selected.registeredFrom],
                  [c.registeredTo, selected.registeredTo],
                ] as const
              ).map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <dt className="text-xs text-ink-muted">{label}</dt>
                    <dd className="m-0 mt-0.5 font-medium text-ink">{value}</dd>
                  </div>
                ) : null,
              )}
              <div>
                <dt className="text-xs text-ink-muted">{c.colSimilarity}</dt>
                <dd className="m-0 mt-1">
                  <SimilarityBar value={selected.similarity} />
                </dd>
              </div>
              {selected.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.imageUrl}
                  alt=""
                  className="max-h-40 rounded-lg border border-black/5 object-contain"
                />
              ) : null}
            </dl>

            <button
              type="button"
              onClick={() => setShowRaw((v) => !v)}
              className="text-xs font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline"
            >
              {showRaw ? c.hideRaw : c.showRaw}
            </button>
            {showRaw ? (
              <pre className="max-h-80 overflow-auto rounded-xl bg-surface-muted p-3 text-[11px] leading-relaxed text-ink">
                {JSON.stringify(selected, null, 2)}
              </pre>
            ) : null}
          </div>
        ) : null}
      </AdminDetailDrawer>
    </div>
  );
}
