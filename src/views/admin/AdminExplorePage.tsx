import type { Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { AdminExplorePanel } from "@/components/organisms/admin/AdminExplorePanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";

export async function AdminExplorePage({ locale }: { locale: Locale }) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/explore/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
      <AdminExplorePanel locale={locale} />
    </AppShell>
  );
}
