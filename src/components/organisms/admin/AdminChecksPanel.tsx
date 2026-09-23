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
import { TrademarkReportView } from "@/components/organisms/TrademarkReportView";
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
  const [failed, setFailed] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
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
          setFailed(true);
          return;
        }
        doc = json.conclusion;
      }
      const { downloadConclusionPdf } = await import(
        "@/components/pdf/conclusion/downloadConclusionPdf"
      );
      await downloadConclusionPdf(doc);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      <Button
        type="button"
        className="w-full"
        disabled={busy}
        onClick={() => void onClick()}
      >
        {busy ? copy.downloading : copy.downloadPdf}
      </Button>
      {failed ? (
        <p className="m-0 text-center text-xs text-danger" role="alert">
          {copy.downloadFailed}
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
                { label: copy.adminChecks.colSource, value: selected.source },
                {
                  label: copy.adminChecks.risk,
                  value: riskFromReport(selected.report) || "—",
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
              <TrademarkReportView
                locale={locale}
                report={report}
                density="drawer"
                showLawyers
              />
            ) : (
              <p className="m-0 text-sm text-ink-muted">
                {copy.adminChecks.report}: —
                {classesLabel(selected.nice_classes) !== "—"
                  ? ` · ${classesLabel(selected.nice_classes)}`
                  : ""}
              </p>
            )}
          </div>
        ) : null}
      </AdminDetailDrawer>
    </AdminListPage>
  );
}
