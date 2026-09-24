import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminOrdersPanel,
  type AdminOrderRow,
} from "@/components/organisms/admin/AdminOrdersPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import {
  parseAdminListParams,
  type AdminListSearchParams,
} from "@/lib/admin/list-params";

export async function AdminOrdersPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: AdminListSearchParams;
}) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/orders/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q, status, from, to, pageSize } =
    parseAdminListParams(searchParams);

  let rows: AdminOrderRow[] = [];
  let total = 0;

  if (db) {
    let query = db
      .from("service_orders")
      .select(
        "id, service_slug, status, locale, created_at, payload, check_id, attorney_id",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) query = query.eq("status", status);
    if (q) {
      const pattern = `%${q}%`;
      query = query.or(
        `service_slug.ilike.${pattern},id.ilike.${pattern}`,
      );
    }

    const { data, count } = await query;
    rows = (data || []) as AdminOrderRow[];
    total = count ?? 0;
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
      <AdminOrdersPanel
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
