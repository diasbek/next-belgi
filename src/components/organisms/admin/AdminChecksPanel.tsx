"use client";

import { Suspense, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { getConclusionCopy } from "@/lib/conclusion/copy";
import type { ConclusionDocument } from "@/lib/conclusion";
import type { TrademarkReport } from "@/lib/check/types";
import { AdminListPage } from "@/components/templates/AdminListPage";
import {
  AdminUrlFilters,
  AdminPageLink,
} from "@/components/molecules/admin/AdminUrlFilters";
import {
  AdminDataTable,
  AdminCardList,
  type AdminColumn,
} from "@/components/organisms/admin/AdminDataTable";
import { AdminDetailDrawer } from "@/components/organisms/admin/AdminDetailDrawer";
import { AdminDetailRows } from "@/components/atoms/admin/AdminDetail";
import {
  StatusBadge,
  statusToneFromValue,
} from "@/components/atoms/admin/StatusBadge";
import { Button } from "@/components/atoms/Button";
import {
  formatAdminDate,
  shortId,
} from "@/lib/admin/list-params";

export type AdminCheckRow = {
  id: string;
  query: string;
  activity_raw: string | null;
  locale: string;
  source: string;
  created_at: string;
  user_id: string | null;
  nice_classes: unknown;
  report: unknown;
  conclusion_doc?: unknown;
};

function riskFromReport(report: unknown): string {
  if (report && typeof report === "object" && "riskLevel" in report) {
    return String((report as { riskLevel?: string }).riskLevel ?? "");
  }
  return "";
}

function classesLabel(nice: unknown): string {
  if (!Array.isArray(nice)) return "—";
  const parts: string[] = [];
  for (const item of nice) {
    if (typeof item === "number" || typeof item === "string") {
      parts.push(String(item));
      continue;
    }
    if (item && typeof item === "object") {
      const n = (item as { classNumber?: unknown }).classNumber;
      if (typeof n === "number") parts.push(String(n));
    }
  }
  return parts.slice(0, 12).join(", ") || "—";
}

function asReport(report: unknown): TrademarkReport | null {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return null;
  }
  const r = report as TrademarkReport;
  if (typeof r.query !== "string" || !Array.isArray(r.sources)) return null;
  return r;
}

function asConclusion(value: unknown): ConclusionDocument | null {
  if (
    value &&
    typeof value === "object" &&
    "verdict" in value &&
    "subject" in value &&
    "verification" in value
  ) {
    return value as ConclusionDocument;
  }
  return null;
}

function AdminCheckPdfButton({
  locale,
  checkId,
  conclusion,
}: {
  locale: Locale;
  checkId: string;
  conclusion: ConclusionDocument | null;
}) {
  const copy = getConclusionCopy(locale);
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      let doc = conclusion;
      if (!doc) {
        const res = await fetch(
          `/api/account/checks/${encodeURIComponent(checkId)}/`,
          { credentials: "include" },
        );
        const json = (await res.json()) as {
          ok?: boolean;
          conclusion?: ConclusionDocument | null;
        };
        if (!res.ok || !json.ok || !json.conclusion) {
          console.warn("[admin:checks:pdf]", json);
          return;
        }
        doc = json.conclusion;
      }
      const { downloadConclusionPdf } = await import(
        "@/components/pdf/conclusion/downloadConclusionPdf"
      );
      await downloadConclusionPdf(doc);
    } catch (e) {
      console.warn("[admin:checks:pdf]", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      className="w-full"
      disabled={busy}
      onClick={() => void onClick()}
    >
      {busy ? copy.downloading : copy.downloadPdf}
    </Button>
  );
}

function CheckResultPreview({
  locale,
  report,
}: {
  locale: Locale;
  report: TrademarkReport;
}) {
  const copy = getAppCopy(locale);
  const conclusionCopy = getConclusionCopy(locale);

  return (
    <div className="space-y-5">
      <div>
        <p className="m-0 text-xs text-ink-muted">{copy.adminChecks.report}</p>
        <h3 className="m-0 mt-1 text-lg font-semibold text-ink">
          {report.conclusion?.title || report.query}
        </h3>
        {report.conclusion?.lead ? (
          <p className="m-0 mt-2 text-sm leading-relaxed text-ink">
            {report.conclusion.lead}
          </p>
        ) : null}
      </div>

      {report.classRisks?.length ? (
        <div>
          <p className="m-0 mb-2 text-xs text-ink-muted">
            {conclusionCopy.verdictTitle}
          </p>
          <ul className="m-0 list-none space-y-1.5 p-0">
            {report.classRisks.map((cr) => (
              <li
                key={cr.classNumber}
                className="flex items-center justify-between rounded-lg bg-[#f3f4f1] px-3 py-2 text-sm"
              >
                <span>
                  {conclusionCopy.classLabel} {cr.classNumber}
                </span>
                <span className="font-semibold tabular-nums">{cr.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.sources.map((source) => (
        <div key={source.id}>
          <p className="m-0 mb-2 text-xs font-medium text-ink-muted">
            {source.title}
          </p>
          {source.empty || source.matches.length === 0 ? (
            <p className="m-0 text-sm text-ink-muted">
              {source.emptyText || conclusionCopy.emptyMatches}
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-black/5 overflow-hidden rounded-xl border border-black/5 p-0">
              {source.matches.slice(0, 8).map((m) => (
                <li key={m.id} className="flex gap-3 px-3 py-2.5">
                  {m.imageUrl ? (
                    <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f3f4f1]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.imageUrl}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-sm font-medium text-ink">
                      {m.name}
                    </p>
                    {m.owner ? (
                      <p className="m-0 truncate text-xs text-ink-muted">
                        {m.owner}
                      </p>
                    ) : null}
                    {m.classesText ? (
                      <p className="m-0 mt-0.5 line-clamp-2 text-xs text-ink-muted">
                        {m.classesText}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 self-start rounded-full bg-[#eceee8] px-2 py-0.5 text-xs font-semibold tabular-nums">
                    {m.similarity}%
                  </span>
                </li>
              ))}
              {source.matches.length > 8 ? (
                <li className="px-3 py-2 text-xs text-ink-muted">
                  +{source.matches.length - 8}
                </li>
              ) : null}
            </ul>
          )}
        </div>
      ))}

      {report.disclaimer ? (
        <p className="m-0 text-xs leading-relaxed text-ink-muted">
          {report.disclaimer}
        </p>
      ) : null}
    </div>
  );
}

export function AdminChecksPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminCheckRow[];
  total: number;
  page: number;
  pageSize: number;
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);
  const [selected, setSelected] = useState<AdminCheckRow | null>(null);
  const report = selected ? asReport(selected.report) : null;
  const conclusion = selected
    ? asConclusion(selected.conclusion_doc)
    : null;

  const columns: AdminColumn<AdminCheckRow>[] = [
    {
      id: "query",
      header: copy.adminChecks.colQuery,
      cell: (r) => <span className="font-medium">{r.query}</span>,
    },
    {
      id: "activity",
      header: copy.adminChecks.colActivity,
      cell: (r) => r.activity_raw || "—",
      hideOnMobile: true,
    },
    {
      id: "source",
      header: copy.adminChecks.colSource,
      cell: (r) => r.source,
    },
    {
      id: "risk",
      header: copy.adminChecks.risk,
      cell: (r) => {
        const risk = riskFromReport(r.report);
        return risk ? (
          <StatusBadge tone={statusToneFromValue(risk)}>{risk}</StatusBadge>
        ) : (
          "—"
        );
      },
    },
    {
      id: "date",
      header: copy.adminChecks.colDate,
      cell: (r) => formatAdminDate(r.created_at, locale),
      hideOnMobile: true,
    },
    {
      id: "user",
      header: copy.adminChecks.colUser,
      cell: (r) => (r.user_id ? shortId(r.user_id) : "—"),
      hideOnMobile: true,
    },
  ];

  const empty =
    !dbUnavailable && rows.length === 0
      ? { title: copy.adminChecks.empty, lead: copy.adminChecks.emptyLead }
      : null;

  return (
    <AdminListPage
      title={copy.adminChecks.title}
      lead={copy.adminChecks.lead}
      badge={total || undefined}
      dbUnavailable={dbUnavailable}
      dbUnavailableMessage={copy.adminUi.dbUnavailable}
      empty={empty}
      filters={
        <Suspense fallback={null}>
          <AdminUrlFilters
            searchPlaceholder={copy.adminUi.search}
            clearLabel={copy.adminUi.clearFilters}
          />
        </Suspense>
      }
      footer={
        total > 0 ? (
          <Suspense fallback={null}>
            <AdminPageLink
              page={page}
              pageSize={pageSize}
              total={total}
              shownLabel={copy.adminUi.shown}
            />
          </Suspense>
        ) : null
      }
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        onRowClick={setSelected}
        selectedId={selected?.id}
      />
      <AdminCardList
        rows={rows}
        onRowClick={setSelected}
        selectedId={selected?.id}
        renderCard={(r) => {
          const risk = riskFromReport(r.report);
          return (
            <div>
              <p className="m-0 font-medium text-ink">
                {r.query}
                {r.activity_raw ? ` · ${r.activity_raw}` : ""}
              </p>
              <p className="m-0 mt-1 text-xs text-ink-muted">
                {[r.source, risk, formatAdminDate(r.created_at, locale)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          );
        }}
      />

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.query || copy.adminChecks.detailTitle}
        wide
        footer={
          selected ? (
            <AdminCheckPdfButton
              locale={locale}
              checkId={selected.id}
              conclusion={conclusion}
            />
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            <AdminDetailRows
              rows={[
                { label: copy.adminChecks.colQuery, value: selected.query },
                {
                  label: copy.adminChecks.colActivity,
                  value: selected.activity_raw || "—",
                },
                { label: copy.adminChecks.colSource, value: selected.source },
                {
                  label: copy.adminChecks.risk,
                  value: riskFromReport(selected.report) || "—",
                },
                {
                  label: copy.adminChecks.classes,
                  value:
                    report?.niceClasses?.join(", ") ||
                    classesLabel(selected.nice_classes),
                },
                {
                  label: copy.adminChecks.colUser,
                  value: selected.user_id || "—",
                },
                {
                  label: copy.adminChecks.colDate,
                  value: formatAdminDate(selected.created_at, locale),
                },
              ]}
            />
            {report ? (
              <CheckResultPreview locale={locale} report={report} />
            ) : (
              <p className="m-0 text-sm text-ink-muted">
                {copy.adminChecks.report}: —
              </p>
            )}
          </div>
        ) : null}
      </AdminDetailDrawer>
    </AdminListPage>
  );
}
