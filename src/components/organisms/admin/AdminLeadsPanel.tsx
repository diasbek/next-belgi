"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import type { LeadStatus } from "@/lib/db/types";
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
import { AdminSelect } from "@/components/atoms/admin/AdminField";
import { Button } from "@/components/atoms/Button";
import { formatAdminDate } from "@/lib/admin/list-params";

export type AdminLeadRow = {
  id: string;
  type: string;
  status: string;
  locale: string;
  created_at: string;
  payload: unknown;
};

function payloadPreview(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const p = payload as Record<string, string>;
  return p.name || p.email || p.phone || "";
}

export function AdminLeadsPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminLeadRow[];
  total: number;
  page: number;
  pageSize: number;
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [selected, setSelected] = useState<AdminLeadRow | null>(null);
  const [status, setStatus] = useState<LeadStatus>("new");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function openRow(row: AdminLeadRow) {
    setSelected(row);
    setStatus(
      row.status === "sent" || row.status === "failed" || row.status === "new"
        ? row.status
        : "new",
    );
    setMsg(null);
  }

  async function saveStatus() {
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/leads/${selected.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMsg(json.error || copy.adminUi.error);
        return;
      }
      setSelected({ ...selected, status });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const columns: AdminColumn<AdminLeadRow>[] = [
    {
      id: "type",
      header: copy.adminLeads.colType,
      cell: (r) => <span className="font-medium">{r.type}</span>,
    },
    {
      id: "status",
      header: copy.adminLeads.colStatus,
      cell: (r) => (
        <StatusBadge tone={statusToneFromValue(r.status)}>{r.status}</StatusBadge>
      ),
    },
    {
      id: "contact",
      header: copy.adminPayments.colUser,
      cell: (r) => payloadPreview(r.payload) || r.id.slice(0, 8),
    },
    {
      id: "date",
      header: copy.adminLeads.colDate,
      cell: (r) => formatAdminDate(r.created_at, locale),
      hideOnMobile: true,
    },
  ];

  const empty =
    !dbUnavailable && rows.length === 0
      ? { title: copy.adminLeads.empty, lead: copy.adminLeads.emptyLead }
      : null;

  return (
    <AdminListPage
      title={copy.adminLeads.title}
      lead={copy.adminLeads.lead}
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
              { value: "new", label: "new" },
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
        onRowClick={openRow}
        selectedId={selected?.id}
      />
      <AdminCardList
        rows={rows}
        onRowClick={openRow}
        selectedId={selected?.id}
        renderCard={(r) => (
          <div>
            <p className="m-0 font-medium text-ink">
              {r.type} · {payloadPreview(r.payload) || r.id.slice(0, 8)}
            </p>
            <p className="m-0 mt-1 text-xs text-ink-muted">
              {r.status} · {formatAdminDate(r.created_at, locale)}
            </p>
          </div>
        )}
      />

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={copy.adminLeads.detailTitle}
        footer={
          selected ? (
            <div className="flex flex-wrap items-end gap-2">
              <label className="min-w-[8rem] flex-1">
                <span className="mb-1 block text-xs text-ink-muted">
                  {copy.adminLeads.colStatus}
                </span>
                <AdminSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                >
                  <option value="new">new</option>
                  <option value="sent">sent</option>
                  <option value="failed">failed</option>
                </AdminSelect>
              </label>
              <Button type="button" disabled={busy} onClick={() => void saveStatus()}>
                {copy.adminLeads.saveStatus}
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4">
            {msg ? (
              <p className="text-sm text-danger" role="alert">
                {msg}
              </p>
            ) : null}
            <AdminDetailRows
              rows={[
                { label: "ID", value: selected.id },
                { label: copy.adminLeads.colType, value: selected.type },
                {
                  label: copy.adminLeads.colStatus,
                  value: (
                    <StatusBadge tone={statusToneFromValue(selected.status)}>
                      {selected.status}
                    </StatusBadge>
                  ),
                },
                { label: "Locale", value: selected.locale },
                {
                  label: copy.adminLeads.colDate,
                  value: formatAdminDate(selected.created_at, locale),
                },
              ]}
            />
            <AdminJsonBlock value={selected.payload ?? {}} />
          </div>
        ) : null}
      </AdminDetailDrawer>
    </AdminListPage>
  );
}
