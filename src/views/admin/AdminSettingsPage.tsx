import type { Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  DashPageHeader,
  DashPanel,
} from "@/components/molecules/DashChrome";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { listIntegrationStatuses } from "@/lib/integrations/store";
import { hasSecretsMasterKey } from "@/lib/crypto/aes";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import Link from "next/link";

export async function AdminSettingsPage({ locale }: { locale: Locale }) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/settings/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const integrations = await listIntegrationStatuses();

  const envRows = [
    { label: "Supabase (env)", ok: isSupabaseConfigured() },
    { label: "SECRETS_MASTER_KEY", ok: hasSecretsMasterKey() },
    {
      label: "SESSION_SECRET",
      ok: Boolean(process.env.SESSION_SECRET?.trim()),
    },
    {
      label: "OTP_PEPPER",
      ok: Boolean(
        process.env.OTP_PEPPER?.trim() || process.env.SESSION_SECRET?.trim(),
      ),
    },
  ];

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
      <DashPageHeader
        title={copy.adminSettings.title}
        lead={copy.adminSettings.lead}
      />
      <p className="mb-5 max-w-xl text-sm text-ink-muted">
        {copy.adminSettings.envNote}
      </p>

      <DashPanel className="mb-5 overflow-hidden">
        <ul className="m-0 divide-y divide-black/5 p-0 text-sm">
          {envRows.map((row) => (
            <li
              key={row.label}
              className="flex justify-between px-4 py-3 sm:px-5"
            >
              <span>{row.label}</span>
              <span className={row.ok ? "text-success" : "text-danger"}>
                {row.ok ? "ok" : "missing"}
              </span>
            </li>
          ))}
        </ul>
      </DashPanel>

      <DashPanel className="overflow-hidden p-0">
        <div className="border-b border-black/5 px-4 py-3 sm:px-5">
          <h2 className="m-0 text-base font-semibold text-ink">
            {copy.nav.integrations}
          </h2>
        </div>
        <ul className="m-0 divide-y divide-black/5 p-0 text-sm">
          {integrations.map((i) => (
            <li
              key={i.provider}
              className="flex justify-between px-4 py-3 sm:px-5"
            >
              <span className="capitalize">{i.provider}</span>
              <span>
                {i.configured
                  ? copy.adminIntegrations.configured
                  : copy.adminIntegrations.missing}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-black/5 px-4 py-3 sm:px-5">
          <Link
            href={localePath(locale, "/admin/integrations/")}
            className="text-sm font-medium underline-offset-2 hover:underline"
          >
            {copy.adminIntegrations.title} →
          </Link>
        </div>
      </DashPanel>
    </AppShell>
  );
}
