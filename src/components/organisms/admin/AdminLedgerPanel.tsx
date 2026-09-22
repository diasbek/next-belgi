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
import {
  formatAdminDate,
  shortId,
} from "@/lib/admin/list-params";

export type AdminLedgerRow = {
  id: string;
  user_id: string;
  delta: number;
  balance_after: number;
  reason: string;
  created_at: string;
};

function reasonLabel(
  reason: string,
  billing: ReturnType<typeof getAppCopy>["billing"],
) {
  switch (reason) {
    case "purchase":
      return billing.opPurchase;
    case "check_debit":
      return billing.opCheck;
    case "refund":
      return billing.opRefund;
    case "admin_adjust":
      return billing.opAdjust;
    default:
      return reason;
  }
}

export function AdminLedgerPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminLedgerRow[];
  total: number;
  page: number;
  pageSize: number;
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);

  const columns: AdminColumn<AdminLedgerRow>[] = [
    {
      id: "reason",
      header: copy.adminLedger.colReason,
      cell: (r) => (
        <span className="font-medium">
          {reasonLabel(r.reason, copy.billing)}
        </span>
      ),
    },
    {
      id: "delta",
      header: copy.adminLedger.colDelta,
      cell: (r) => (
        <span className={r.delta > 0 ? "text-success" : undefined}>
          {r.delta > 0 ? "+" : ""}
          {r.delta}
        </span>
      ),
    },
    {
      id: "balance",
      header: copy.adminLedger.colBalance,
      cell: (r) => r.balance_after,
    },
    {
      id: "user",
      header: copy.adminLedger.colUser,
      cell: (r) => shortId(r.user_id),
      hideOnMobile: true,
    },
    {
      id: "date",
      header: copy.adminLedger.colDate,
      cell: (r) => formatAdminDate(r.created_at, locale),
      hideOnMobile: true,
    },
  ];

  const empty =
    !dbUnavailable && rows.length === 0
      ? { title: copy.adminLedger.empty, lead: copy.adminLedger.emptyLead }
      : null;

  return (
    <AdminListPage
      title={copy.adminLedger.title}
      lead={copy.adminLedger.lead}
      badge={total || undefined}
      dbUnavailable={dbUnavailable}
      dbUnavailableMessage={copy.adminUi.dbUnavailable}
      empty={empty}
      filters={
        <Suspense fallback={null}>
          <AdminUrlFilters
            searchPlaceholder={copy.adminUi.search}
            clearLabel={copy.adminUi.clearFilters}
            reasonOptions={[
              { value: "", label: copy.adminLedger.allReasons },
              { value: "purchase", label: copy.billing.opPurchase },
              { value: "check_debit", label: copy.billing.opCheck },
              { value: "refund", label: copy.billing.opRefund },
              { value: "admin_adjust", label: copy.billing.opAdjust },
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
      <AdminDataTable columns={columns} rows={rows} />
      <AdminCardList
        rows={rows}
        renderCard={(r) => (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="m-0 font-medium text-ink">
                {reasonLabel(r.reason, copy.billing)}
              </p>
              <p className="m-0 mt-1 text-xs text-ink-muted">
                {shortId(r.user_id)} · {formatAdminDate(r.created_at, locale)}
              </p>
            </div>
            <span className="font-semibold text-ink">
              {r.delta > 0 ? "+" : ""}
              {r.delta} → {r.balance_after}
            </span>
          </div>
        )}
      />
    </AdminListPage>
  );
}
