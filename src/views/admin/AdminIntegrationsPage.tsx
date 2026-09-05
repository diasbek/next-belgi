import type { Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { IntegrationsPanel } from "@/components/organisms/IntegrationsPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";

export async function AdminIntegrationsPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/integrations/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <IntegrationsPanel locale={locale} />
    </AppShell>
  );
}
