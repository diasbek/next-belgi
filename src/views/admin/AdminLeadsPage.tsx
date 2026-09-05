import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminLeadsPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/leads/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data } = db
    ? await db
        .from("leads")
        .select("id, type, status, locale, created_at, payload")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminLeads.title}</h1>
      <p className={sectionLead}>{copy.adminLeads.lead}</p>
      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {(data || []).map((l) => {
          const payload = (l.payload || {}) as Record<string, string>;
          return (
            <li key={l.id} className="py-3">
              <p className="font-medium">
                {l.type} · {l.status} · {payload.name || payload.email || l.id}
              </p>
              <p className="text-ink-muted">
                {new Date(l.created_at).toLocaleString()}
              </p>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
