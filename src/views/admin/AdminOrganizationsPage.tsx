import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { PageContainer } from "@/components/atoms/PageContainer";
import { formatAdminDate } from "@/lib/admin/list-params";
import { AdminOrgActivate } from "@/components/organisms/admin/AdminOrgActivate";

export async function AdminOrganizationsPage({ locale }: { locale: Locale }) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/organizations/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  type Org = {
    id: string;
    name: string;
    status: string;
    contact_email: string | null;
    volume_hint: string | null;
    created_at: string;
  };

  let orgs: Org[] = [];
  if (db) {
    const { data } = await db
      .from("organizations")
      .select("id, name, status, contact_email, volume_hint, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    orgs = (data || []) as Org[];
  }

  const title =
    locale === "ru"
      ? "Организации (B2B)"
      : locale === "en"
        ? "Organizations (B2B)"
        : "Tashkilotlar (B2B)";

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
      <PageContainer className="py-8">
        <h1 className="m-0 font-display text-2xl font-semibold text-ink">
          {title}
        </h1>
        {!db ? (
          <p className="mt-4 text-sm text-ink-muted">{copy.adminUi.dbUnavailable}</p>
        ) : orgs.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">
            {locale === "ru"
              ? "Waitlist пуст."
              : locale === "en"
                ? "Waitlist is empty."
                : "Waitlist boʻsh."}
          </p>
        ) : (
          <ul className="mt-6 m-0 list-none space-y-3 p-0">
            {orgs.map((org) => (
              <li
                key={org.id}
                className="flex flex-col gap-3 rounded-xl bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="m-0 font-semibold text-ink">{org.name}</p>
                  <p className="m-0 mt-1 text-sm text-ink-muted">
                    {org.status} · {org.contact_email || "—"} ·{" "}
                    {formatAdminDate(org.created_at, locale)}
                  </p>
                  {org.volume_hint ? (
                    <p className="m-0 mt-1 text-xs text-ink-muted">
                      {org.volume_hint}
                    </p>
                  ) : null}
                </div>
                <AdminOrgActivate orgId={org.id} locale={locale} status={org.status} />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </AppShell>
  );
}
