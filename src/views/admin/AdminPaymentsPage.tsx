import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminPaymentsPanel,
  type AdminPaymentRow,
} from "@/components/organisms/admin/AdminPaymentsPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import {
  parseAdminListParams,
  type AdminListSearchParams,
} from "@/lib/admin/list-params";

export async function AdminPaymentsPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: AdminListSearchParams;
}) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/payments/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q, status, from, to, pageSize } =
    parseAdminListParams(searchParams);

  let rows: AdminPaymentRow[] = [];
  let total = 0;

  if (db) {
    let query = db
      .from("payments")
      .select(
        "id, provider, amount_uzs, credits, status, created_at, user_id, provider_payment_id, raw",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) query = query.eq("status", status);
    if (q) {
      const pattern = `%${q}%`;
      query = query.or(
        `provider.ilike.${pattern},provider_payment_id.ilike.${pattern},user_id.eq.${q}`,
      );
    }

    const { data, count } = await query;
    rows = (data || []) as AdminPaymentRow[];
    total = count ?? 0;
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <AdminPaymentsPanel
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
