import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminPlansPanel,
  type AdminPlanRow,
} from "@/components/organisms/admin/AdminPlansPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";

export async function AdminPlansPage({ locale }: { locale: Locale }) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/plans/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data } = db
    ? await db.from("billing_plans").select("*").order("sort")
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
      <AdminPlansPanel
        locale={locale}
        rows={(data || []) as AdminPlanRow[]}
        dbUnavailable={!db}
      />
    </AppShell>
  );
}
