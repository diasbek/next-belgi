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
import { formatAdminDate } from "@/lib/admin/list-params";

export type AdminNotificationRow = {
  id: string;
  provider: string;
  kind: string;
  destination: string | null;
  status: string;
  provider_message_id: string | null;
  meta: unknown;
  created_at: string;
};

export function AdminNotificationsPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminNotificationRow[];
  total: number;
  page: number;
  pageSize: number;
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);
  const [selected, setSelected] = useState<AdminNotificationRow | null>(null);

  const columns: AdminColumn<AdminNotificationRow>[] = [
    {
      id: "provider",
      header: copy.adminNotifications.colProvider,
      cell: (r) => (
        <span className="font-medium">
          {r.provider}/{r.kind}
        </span>
      ),
    },
    {
      id: "status",
      header: copy.adminNotifications.colStatus,
      cell: (r) => (
        <StatusBadge tone={statusToneFromValue(r.status)}>{r.status}</StatusBadge>
      ),
    },
    {
      id: "dest",
      header: copy.adminNotifications.colDest,
      cell: (r) => r.destination || "—",
    },
    {
      id: "date",
      header: copy.adminNotifications.colDate,
      cell: (r) => formatAdminDate(r.created_at, locale),
      hideOnMobile: true,
    },
  ];

  const empty =
    !dbUnavailable && rows.length === 0
      ? {
          title: copy.adminNotifications.empty,
          lead: copy.adminNotifications.emptyLead,
        }
      : null;

  return (
    <AdminListPage
      title={copy.adminNotifications.title}
      lead={copy.adminNotifications.lead}
      badge={total || undefined}
      dbUnavailable={dbUnavailable}
      dbUnavailableMessage={copy.adminUi.dbUnavailable}
      empty={empty}
      filters={
        <Suspense fallback={null}>
          <AdminUrlFilters
            searchPlaceholder={copy.adminUi.search}
            clearLabel={copy.adminUi.clearFilters}
            statusOptions={[
              { value: "", label: copy.adminPayments.allStatuses },
              { value: "queued", label: "queued" },
              { value: "sent", label: "sent" },
              { value: "failed", label: "failed" },
            ]}
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
        renderCard={(r) => (
          <div>
            <p className="m-0 font-medium text-ink">
              {r.provider}/{r.kind} · {r.status}
            </p>
            <p className="m-0 mt-1 text-xs text-ink-muted">
              {r.destination || "—"} · {formatAdminDate(r.created_at, locale)}
            </p>
          </div>
        )}
      />

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={copy.adminNotifications.detailTitle}
      >
        {selected ? (
          <div className="space-y-4">
            <AdminDetailRows
              rows={[
                { label: copy.adminNotifications.colProvider, value: selected.provider },
                { label: copy.adminNotifications.colKind, value: selected.kind },
                {
                  label: copy.adminNotifications.colStatus,
                  value: (
                    <StatusBadge tone={statusToneFromValue(selected.status)}>
                      {selected.status}
                    </StatusBadge>
                  ),
                },
                {
                  label: copy.adminNotifications.colDest,
                  value: selected.destination || "—",
                },
                {
                  label: "Message ID",
                  value: selected.provider_message_id || "—",
                },
                {
                  label: copy.adminNotifications.colDate,
                  value: formatAdminDate(selected.created_at, locale),
                },
              ]}
            />
            <AdminJsonBlock value={selected.meta ?? {}} />
          </div>
        ) : null}
      </AdminDetailDrawer>
    </AdminListPage>
  );
}
