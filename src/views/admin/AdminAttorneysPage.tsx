import type { Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { AdminAttorneysPanel } from "@/components/organisms/admin/AdminAttorneysPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { PATENT_ATTORNEYS } from "@/data/patent-attorneys";

export async function AdminAttorneysPage({ locale }: { locale: Locale }) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/attorneys/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
      <AdminAttorneysPanel locale={locale} attorneys={PATENT_ATTORNEYS} />
    </AppShell>
  );
}
