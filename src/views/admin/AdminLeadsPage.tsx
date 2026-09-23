import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminLeadsPanel,
  type AdminLeadRow,
} from "@/components/organisms/admin/AdminLeadsPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import {
  parseAdminListParams,
  type AdminListSearchParams,
} from "@/lib/admin/list-params";

export async function AdminLeadsPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: AdminListSearchParams;
}) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/leads/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q, status, from, to, pageSize } =
    parseAdminListParams(searchParams);

  let rows: AdminLeadRow[] = [];
  let total = 0;

  if (db) {
    let query = db
      .from("leads")
      .select("id, type, status, locale, created_at, payload", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) query = query.eq("status", status);
    if (q) {
      const pattern = `%${q}%`;
      query = query.or(`type.ilike.${pattern},id.ilike.${pattern}`);
    }

    const { data, count } = await query;
    rows = (data || []) as AdminLeadRow[];
    total = count ?? 0;
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
      <AdminLeadsPanel
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
