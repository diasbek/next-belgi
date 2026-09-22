"use client";

import { Suspense } from "react";
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
import { formatAdminDate } from "@/lib/admin/list-params";

export type AdminRegistryRow = {
  id: number;
  number: string | null;
  transliteration: string | null;
  trademark_type: string | null;
  status: string | null;
  owner: string | null;
  applicant: string | null;
  registration_number: string | null;
  updated_at: string;
};

type RegistryTableRow = Omit<AdminRegistryRow, "id"> & { id: string; numericId: number };

export function AdminRegistryPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  registryCount,
  importStatus,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminRegistryRow[];
  total: number;
  page: number;
  pageSize: number;
  registryCount: number;
  importStatus: string;
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);

  const columns: AdminColumn<RegistryTableRow>[] = [
    {
      id: "name",
      header: copy.adminChecks.colQuery,
      cell: (r) => (
        <span className="font-medium">
          {r.transliteration || r.number || `#${r.numericId}`}
        </span>
      ),
    },
    {
      id: "status",
      header: copy.adminPayments.colStatus,
      cell: (r) => r.status || "—",
    },
    {
      id: "owner",
      header: copy.adminPayments.colUser,
      cell: (r) => r.owner || r.applicant || "—",
      hideOnMobile: true,
    },
    {
      id: "date",
      header: copy.adminPayments.colDate,
      cell: (r) => formatAdminDate(r.updated_at, locale),
      hideOnMobile: true,
    },
  ];

  const mapped: RegistryTableRow[] = rows.map((r) => ({
    ...r,
    id: String(r.id),
    numericId: r.id,
  }));

  const empty =
    !dbUnavailable && rows.length === 0
      ? { title: copy.adminRegistry.empty }
      : null;

  return (
    <AdminListPage
      title={copy.adminRegistry.title}
      lead={copy.adminRegistry.lead}
      badge={registryCount || undefined}
      dbUnavailable={dbUnavailable}
      dbUnavailableMessage={copy.adminUi.dbUnavailable}
      empty={empty}
      stats={
        <dl className="mb-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between rounded-xl border border-black/5 bg-white px-4 py-3">
            <dt className="text-ink-muted">{copy.adminRegistry.count}</dt>
            <dd className="m-0 font-semibold">{registryCount.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between rounded-xl border border-black/5 bg-white px-4 py-3">
            <dt className="text-ink-muted">{copy.adminRegistry.importStatus}</dt>
            <dd className="m-0 font-semibold">{importStatus}</dd>
          </div>
        </dl>
      }
      filters={
        <Suspense fallback={null}>
          <AdminUrlFilters
            searchPlaceholder={copy.adminRegistry.searchPlaceholder}
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
      <AdminDataTable columns={columns} rows={mapped} />
      <AdminCardList
        rows={mapped}
        renderCard={(r) => (
          <div>
            <p className="m-0 font-medium text-ink">
              {r.transliteration || r.number || `#${r.numericId}`}
            </p>
            <p className="m-0 mt-1 text-xs text-ink-muted">
              {[r.number, r.registration_number, r.status, r.trademark_type]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="m-0 mt-0.5 text-xs text-ink-muted">
              {[r.owner || r.applicant, formatAdminDate(r.updated_at, locale)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        )}
      />
    </AdminListPage>
  );
}
