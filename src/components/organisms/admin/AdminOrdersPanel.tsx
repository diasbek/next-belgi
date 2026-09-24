"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
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
import { AdminSelect } from "@/components/atoms/admin/AdminField";
import { Button } from "@/components/atoms/Button";
import { formatAdminDate } from "@/lib/admin/list-params";

export type AdminOrderRow = {
  id: string;
  service_slug: string;
  status: string;
  locale: string;
  created_at: string;
  payload: unknown;
  check_id: string | null;
  attorney_id: string | null;
};

const STATUSES = ["draft", "submitted", "in_progress", "done", "cancelled"] as const;

function payloadPreview(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const p = payload as Record<string, string>;
  return p.name || p.email || p.orgName || p.mark || "";
}

export function AdminOrdersPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminOrderRow[];
  total: number;
  page: number;
  pageSize: number;
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [selected, setSelected] = useState<AdminOrderRow | null>(null);
  const [status, setStatus] = useState<string>("submitted");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function openRow(row: AdminOrderRow) {
    setSelected(row);
    setStatus(row.status);
    setMsg(null);
  }

  async function saveStatus() {
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${selected.id}/`, {
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

  const columns: AdminColumn<AdminOrderRow>[] = [
    {
      id: "slug",
      header: copy.adminOrders.colService,
      cell: (r) => <span className="font-medium">{r.service_slug}</span>,
    },
    {
      id: "status",
      header: copy.adminOrders.colStatus,
      cell: (r) => (
        <StatusBadge tone={statusToneFromValue(r.status)}>{r.status}</StatusBadge>
      ),
    },
    {
      id: "contact",
      header: copy.adminOrders.colContact,
      cell: (r) => payloadPreview(r.payload) || r.id.slice(0, 8),
    },
    {
      id: "date",
      header: copy.adminOrders.colDate,
      cell: (r) => formatAdminDate(r.created_at, locale),
      hideOnMobile: true,
    },
  ];

  return (
    <AdminListPage
      title={copy.adminOrders.title}
      lead={copy.adminOrders.lead}
      badge={total || undefined}
      dbUnavailable={dbUnavailable}
      dbUnavailableMessage={copy.adminUi.dbUnavailable}
      empty={
        !dbUnavailable && rows.length === 0
          ? { title: copy.adminOrders.empty, lead: copy.adminOrders.emptyLead }
          : null
      }
      filters={
        <Suspense fallback={null}>
          <AdminUrlFilters
            searchPlaceholder={copy.adminUi.search}
            clearLabel={copy.adminUi.clearFilters}
            statusOptions={[
              { value: "", label: copy.adminOrders.allStatuses },
              ...STATUSES.map((s) => ({ value: s, label: s })),
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
              {r.service_slug} · {payloadPreview(r.payload) || r.id.slice(0, 8)}
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
        title={copy.adminOrders.title}
        footer={
          selected ? (
            <div className="flex flex-wrap items-end gap-2">
              <label className="min-w-[8rem] flex-1">
                <span className="mb-1 block text-xs text-ink-muted">
                  {copy.adminOrders.colStatus}
                </span>
                <AdminSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </AdminSelect>
              </label>
              <Button type="button" disabled={busy} onClick={() => void saveStatus()}>
                {copy.adminUi.save}
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
                {
                  label: copy.adminOrders.colService,
                  value: selected.service_slug,
                },
                { label: "Check", value: selected.check_id || "—" },
                { label: "Attorney", value: selected.attorney_id || "—" },
                {
                  label: copy.adminOrders.colDate,
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
