import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminNotificationsPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/notifications/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data } = db
    ? await db
        .from("notification_log")
        .select(
          "id, provider, kind, destination, status, provider_message_id, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminNotifications.title}</h1>
      <p className={sectionLead}>{copy.adminNotifications.lead}</p>
      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {(data || []).length === 0 ? (
          <li className="py-4 text-ink-muted">—</li>
        ) : (
          (data || []).map((row) => (
            <li key={row.id} className="py-3">
              <p className="font-medium text-ink">
                {row.provider}/{row.kind} · {row.status} · {row.destination}
              </p>
              <p className="text-ink-muted">
                {new Date(row.created_at).toLocaleString()}
                {row.provider_message_id
                  ? ` · ${row.provider_message_id}`
                  : ""}
              </p>
            </li>
          ))
        )}
      </ul>
    </AppShell>
  );
}
