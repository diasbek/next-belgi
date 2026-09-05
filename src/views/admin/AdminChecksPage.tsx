import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminChecksPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/checks/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data } = db
    ? await db
        .from("trademark_checks")
        .select("id, query, locale, source, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminChecks.title}</h1>
      <p className={sectionLead}>{copy.adminChecks.lead}</p>
      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {(data || []).map((c) => (
          <li key={c.id} className="flex justify-between gap-2 py-3">
            <span className="font-medium">{c.query}</span>
            <span className="text-ink-muted">
              {c.source} · {new Date(c.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
