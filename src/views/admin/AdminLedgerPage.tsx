import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminLedgerPanel,
  type AdminLedgerRow,
} from "@/components/organisms/admin/AdminLedgerPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import {
  parseAdminListParams,
  type AdminListSearchParams,
} from "@/lib/admin/list-params";

export async function AdminLedgerPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: AdminListSearchParams;
}) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/ledger/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q, reason, from, to, pageSize } =
    parseAdminListParams(searchParams);

  let rows: AdminLedgerRow[] = [];
  let total = 0;

  if (db) {
    let query = db
      .from("ledger_entries")
      .select("id, user_id, delta, balance_after, reason, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (reason) query = query.eq("reason", reason);
    if (q) {
      query = query.or(`user_id.eq.${q},reason.ilike.%${q}%`);
    }

    const { data, count } = await query;
    rows = (data || []) as AdminLedgerRow[];
    total = count ?? 0;
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <AdminLedgerPanel
        locale={locale}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        dbUnavailable={!db}
      />
    </AppShell>
  );
}
