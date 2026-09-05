import type { Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";
import { listIntegrationStatuses } from "@/lib/integrations/store";
import { hasSecretsMasterKey } from "@/lib/crypto/aes";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import Link from "next/link";

export async function AdminSettingsPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/settings/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const integrations = await listIntegrationStatuses();

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminSettings.title}</h1>
      <p className={sectionLead}>{copy.adminSettings.lead}</p>
      <p className="mb-6 max-w-xl text-sm text-ink-muted">
        {copy.adminSettings.envNote}
      </p>

      <ul className="mb-8 divide-y divide-black/5 border-y border-black/5 text-sm">
        <li className="flex justify-between py-3">
          <span>Supabase (env)</span>
          <span>{isSupabaseConfigured() ? "ok" : "missing"}</span>
        </li>
        <li className="flex justify-between py-3">
          <span>SECRETS_MASTER_KEY</span>
          <span>{hasSecretsMasterKey() ? "ok" : "missing"}</span>
        </li>
        <li className="flex justify-between py-3">
          <span>SESSION_SECRET</span>
          <span>
            {process.env.SESSION_SECRET?.trim() ? "ok" : "missing"}
          </span>
        </li>
        <li className="flex justify-between py-3">
          <span>OTP_PEPPER</span>
          <span>
            {process.env.OTP_PEPPER?.trim() || process.env.SESSION_SECRET?.trim()
              ? "ok"
              : "missing"}
          </span>
        </li>
      </ul>

      <h2 className="mb-3 text-lg font-semibold">
        {copy.nav.integrations}
      </h2>
      <ul className="mb-4 divide-y divide-black/5 border-y border-black/5 text-sm">
        {integrations.map((i) => (
          <li key={i.provider} className="flex justify-between py-3">
            <span className="capitalize">{i.provider}</span>
            <span>
              {i.configured
                ? copy.adminIntegrations.configured
                : copy.adminIntegrations.missing}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={localePath(locale, "/admin/integrations/")}
        className="text-sm font-medium underline-offset-2 hover:underline"
      >
        {copy.adminIntegrations.title} →
      </Link>
    </AppShell>
  );
}
