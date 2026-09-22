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
import { Button } from "@/components/atoms/Button";
import {
  formatAdminDate,
  shortId,
} from "@/lib/admin/list-params";

export type AdminPaymentRow = {
  id: string;
  provider: string;
  amount_uzs: number;
  credits: number;
  status: string;
  created_at: string;
  user_id: string;
  provider_payment_id: string | null;
  raw: unknown;
};

function isReviewed(raw: unknown): boolean {
  return Boolean(
    raw &&
      typeof raw === "object" &&
      !Array.isArray(raw) &&
      (raw as { reviewed?: boolean }).reviewed === true,
  );
}

export function AdminPaymentsPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminPaymentRow[];
  total: number;
  page: number;
  pageSize: number;
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [selected, setSelected] = useState<AdminPaymentRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const columns: AdminColumn<AdminPaymentRow>[] = [
    {
      id: "provider",
      header: copy.adminPayments.colProvider,
      cell: (r) => <span className="font-medium capitalize">{r.provider}</span>,
    },
    {
      id: "amount",
      header: copy.adminPayments.colAmount,
      cell: (r) => `${r.amount_uzs.toLocaleString()} UZS`,
    },
    {
      id: "credits",
      header: copy.adminPayments.colCredits,
      cell: (r) => r.credits,
    },
    {
      id: "status",
      header: copy.adminPayments.colStatus,
      cell: (r) => (
        <StatusBadge tone={statusToneFromValue(r.status)}>{r.status}</StatusBadge>
      ),
    },
    {
      id: "date",
      header: copy.adminPayments.colDate,
      cell: (r) => formatAdminDate(r.created_at, locale),
      hideOnMobile: true,
    },
    {
      id: "user",
      header: copy.adminPayments.colUser,
      cell: (r) => shortId(r.user_id),
      hideOnMobile: true,
    },
  ];

  async function copyId() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setMsg(copy.adminUi.error);
    }
  }

  async function markReviewed() {
    if (!selected || isReviewed(selected.raw)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/payments/${selected.id}/`, {
        method: "PATCH",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; raw?: unknown };
      if (!res.ok || !json.ok) {
        setMsg(json.error || copy.adminUi.error);
        return;
      }
      setSelected({ ...selected, raw: json.raw });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const empty =
    !dbUnavailable && rows.length === 0
      ? { title: copy.adminPayments.empty, lead: copy.adminPayments.emptyLead }
      : null;

  return (
    <AdminListPage
      title={copy.adminPayments.title}
      lead={copy.adminPayments.lead}
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
              { value: "pending", label: "pending" },
              { value: "paid", label: "paid" },
              { value: "failed", label: "failed" },
              { value: "cancelled", label: "cancelled" },
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
      {msg ? (
        <p className="border-b border-black/5 px-4 py-2 text-sm text-danger" role="alert">
          {msg}
        </p>
      ) : null}
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
            <p className="m-0 font-medium capitalize text-ink">
              {r.provider} · {r.credits} cr
            </p>
            <p className="m-0 mt-1 text-xs text-ink-muted">
              {r.amount_uzs.toLocaleString()} UZS · {r.status} ·{" "}
              {formatAdminDate(r.created_at, locale)}
            </p>
          </div>
        )}
      />

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={copy.adminPayments.detailTitle}
        footer={
          selected ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => void copyId()}>
                {copied ? copy.adminUi.copied : copy.adminPayments.copyId}
              </Button>
              <Button
                type="button"
                disabled={busy || isReviewed(selected.raw)}
                onClick={() => void markReviewed()}
              >
                {isReviewed(selected.raw)
                  ? copy.adminPayments.reviewed
                  : copy.adminPayments.markReviewed}
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4">
            <AdminDetailRows
              rows={[
                { label: "ID", value: selected.id },
                { label: copy.adminPayments.colProvider, value: selected.provider },
                {
                  label: copy.adminPayments.colAmount,
                  value: `${selected.amount_uzs.toLocaleString()} UZS`,
                },
                { label: copy.adminPayments.colCredits, value: selected.credits },
                {
                  label: copy.adminPayments.colStatus,
                  value: (
                    <StatusBadge tone={statusToneFromValue(selected.status)}>
                      {selected.status}
                    </StatusBadge>
                  ),
                },
                {
                  label: copy.adminPayments.colUser,
                  value: selected.user_id,
                },
                {
                  label: copy.adminPayments.providerId,
                  value: selected.provider_payment_id || "—",
                },
                {
                  label: copy.adminPayments.colDate,
                  value: formatAdminDate(selected.created_at, locale),
                },
              ]}
            />
            <div>
              <p className="mb-1.5 text-xs text-ink-muted">{copy.adminPayments.raw}</p>
              <AdminJsonBlock value={selected.raw ?? {}} />
            </div>
          </div>
        ) : null}
      </AdminDetailDrawer>
    </AdminListPage>
  );
}
