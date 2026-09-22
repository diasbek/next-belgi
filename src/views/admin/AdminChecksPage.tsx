import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminChecksPanel,
  type AdminCheckRow,
} from "@/components/organisms/admin/AdminChecksPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import {
  parseAdminListParams,
  type AdminListSearchParams,
} from "@/lib/admin/list-params";

export async function AdminChecksPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: AdminListSearchParams;
}) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/checks/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q, from, to, pageSize } = parseAdminListParams(searchParams);

  let rows: AdminCheckRow[] = [];
  let total = 0;

  if (db) {
    let query = db
      .from("trademark_checks")
      .select(
        "id, query, activity_raw, locale, source, created_at, user_id, nice_classes, report",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (q) {
      const pattern = `%${q}%`;
      query = query.or(
        `query.ilike.${pattern},activity_raw.ilike.${pattern},source.ilike.${pattern}`,
      );
    }

    const { data, count } = await query;
    rows = (data || []) as AdminCheckRow[];
    total = count ?? 0;
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <AdminChecksPanel
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
