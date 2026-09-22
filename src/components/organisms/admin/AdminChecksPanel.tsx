"use client";

import { Suspense, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
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
import {
  AdminDetailRows,
  AdminJsonBlock,
} from "@/components/atoms/admin/AdminDetail";
import {
  StatusBadge,
  statusToneFromValue,
} from "@/components/atoms/admin/StatusBadge";
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
};

function riskFromReport(report: unknown): string {
  if (report && typeof report === "object" && "riskLevel" in report) {
    return String((report as { riskLevel?: string }).riskLevel ?? "");
  }
  return "";
}

function classesLabel(nice: unknown): string {
  if (!Array.isArray(nice)) return "—";
  return nice.map(String).slice(0, 12).join(", ") || "—";
}

function reportSummary(report: unknown): Record<string, unknown> {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return { report };
  }
  const r = report as Record<string, unknown>;
  return {
    riskLevel: r.riskLevel,
    score: r.score,
    summary: r.summary,
    verdict: r.verdict,
    recommendation: r.recommendation,
  };
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
        title={copy.adminChecks.detailTitle}
      >
        {selected ? (
          <div className="space-y-4">
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
                  value: classesLabel(selected.nice_classes),
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
            <div>
              <p className="mb-1.5 text-xs text-ink-muted">{copy.adminChecks.report}</p>
              <AdminJsonBlock value={reportSummary(selected.report)} />
            </div>
          </div>
        ) : null}
      </AdminDetailDrawer>
    </AdminListPage>
  );
}
