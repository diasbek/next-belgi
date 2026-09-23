import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminSessionsPanel,
  type AdminSessionRow,
} from "@/components/organisms/admin/AdminSessionsPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import {
  parseAdminListParams,
  type AdminListSearchParams,
} from "@/lib/admin/list-params";

export async function AdminSessionsPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: AdminListSearchParams;
}) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/sessions/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q, from, to, pageSize } = parseAdminListParams(searchParams);

  let rows: AdminSessionRow[] = [];
  let total = 0;

  if (db) {
    let query = db
      .from("app_sessions")
      .select(
        "id, user_id, created_at, expires_at, revoked_at, last_seen_at, ip, user_agent",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(`user_id.eq.${q},ip.ilike.%${q}%`);
    }

    const { data, count } = await query;
    rows = (data || []) as AdminSessionRow[];
    total = count ?? 0;
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
      <AdminSessionsPanel
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
