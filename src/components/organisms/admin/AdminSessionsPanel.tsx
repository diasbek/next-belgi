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
import { AdminDetailRows } from "@/components/atoms/admin/AdminDetail";
import {
  StatusBadge,
  statusToneFromValue,
} from "@/components/atoms/admin/StatusBadge";
import { ConfirmDialog } from "@/components/molecules/admin/ConfirmDialog";
import { Button } from "@/components/atoms/Button";
import {
  formatAdminDate,
  shortId,
} from "@/lib/admin/list-params";

export type AdminSessionRow = {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_seen_at: string | null;
  ip: string | null;
  user_agent: string | null;
};

function isActive(row: AdminSessionRow): boolean {
  return !row.revoked_at && new Date(row.expires_at) > new Date();
}

export function AdminSessionsPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminSessionRow[];
  total: number;
  page: number;
  pageSize: number;
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [selected, setSelected] = useState<AdminSessionRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function revoke() {
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/sessions/${selected.id}/revoke/`, {
        method: "POST",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMsg(json.error || copy.adminUi.error);
        return;
      }
      setSelected({
        ...selected,
        revoked_at: new Date().toISOString(),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const columns: AdminColumn<AdminSessionRow>[] = [
    {
      id: "user",
      header: copy.adminSessions.colUser,
      cell: (r) => shortId(r.user_id),
    },
    {
      id: "status",
      header: copy.adminSessions.colStatus,
      cell: (r) => {
        const active = isActive(r);
        return (
          <StatusBadge tone={statusToneFromValue(active ? "active" : "revoked")}>
            {active ? copy.adminSessions.active : copy.adminSessions.revoked}
          </StatusBadge>
        );
      },
    },
    {
      id: "created",
      header: copy.adminSessions.colCreated,
      cell: (r) => formatAdminDate(r.created_at, locale),
      hideOnMobile: true,
    },
    {
      id: "expires",
      header: copy.adminSessions.colExpires,
      cell: (r) => formatAdminDate(r.expires_at, locale),
      hideOnMobile: true,
    },
  ];

  const empty =
    !dbUnavailable && rows.length === 0
      ? { title: copy.adminSessions.empty, lead: copy.adminSessions.emptyLead }
      : null;

  return (
    <AdminListPage
      title={copy.adminSessions.title}
      lead={copy.adminSessions.lead}
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
        renderCard={(r) => (
          <div>
            <p className="m-0 font-medium text-ink">
              {isActive(r)
                ? copy.adminSessions.active
                : copy.adminSessions.revoked}{" "}
              · {shortId(r.user_id)}
            </p>
            <p className="m-0 mt-1 text-xs text-ink-muted">
              {[r.ip, formatAdminDate(r.created_at, locale)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        )}
      />

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={copy.adminSessions.title}
        footer={
          selected && isActive(selected) ? (
            <Button
              type="button"
              disabled={busy}
              className="!bg-danger hover:!bg-danger/90"
              onClick={() => setConfirmOpen(true)}
            >
              {copy.adminSessions.revoke}
            </Button>
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
                { label: copy.adminSessions.colUser, value: selected.user_id },
                {
                  label: copy.adminSessions.colStatus,
                  value: isActive(selected)
                    ? copy.adminSessions.active
                    : copy.adminSessions.revoked,
                },
                {
                  label: copy.adminSessions.colCreated,
                  value: formatAdminDate(selected.created_at, locale),
                },
                {
                  label: copy.adminSessions.colExpires,
                  value: formatAdminDate(selected.expires_at, locale),
                },
                {
                  label: "IP",
                  value: selected.ip || "—",
                },
                {
                  label: "User-Agent",
                  value: selected.user_agent || "—",
                },
              ]}
            />
          </div>
        ) : null}
      </AdminDetailDrawer>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={copy.adminSessions.revokeConfirm}
        lead={copy.adminSessions.revokeLead}
        confirmLabel={copy.adminSessions.revoke}
        cancelLabel={copy.adminUi.cancel}
        danger
        onConfirm={() => void revoke()}
      />
    </AdminListPage>
  );
}
