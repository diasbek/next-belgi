import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminSessionsPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/sessions/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data } = db
    ? await db
        .from("app_sessions")
        .select(
          "id, user_id, created_at, expires_at, revoked_at, last_seen_at, ip, user_agent",
        )
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminSessions.title}</h1>
      <p className={sectionLead}>{copy.adminSessions.lead}</p>
      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {(data || []).length === 0 ? (
          <li className="py-4 text-ink-muted">—</li>
        ) : (
          (data || []).map((row) => {
            const active = !row.revoked_at && new Date(row.expires_at) > new Date();
            return (
              <li key={row.id} className="py-3">
                <p className="font-medium text-ink">
                  {active
                    ? copy.adminSessions.active
                    : copy.adminSessions.revoked}{" "}
                  · {row.user_id.slice(0, 8)}…
                </p>
                <p className="text-ink-muted">
                  {[
                    row.ip,
                    new Date(row.created_at).toLocaleString(),
                    row.last_seen_at
                      ? `seen ${new Date(row.last_seen_at).toLocaleString()}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {row.user_agent ? (
                  <p className="truncate text-xs text-ink-muted">{row.user_agent}</p>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </AppShell>
  );
}
