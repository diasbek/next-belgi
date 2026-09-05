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
        .select(
          "id, query, activity_raw, locale, source, created_at, user_id, nice_classes, report",
        )
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminChecks.title}</h1>
      <p className={sectionLead}>{copy.adminChecks.lead}</p>
      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {(data || []).length === 0 ? (
          <li className="py-4 text-ink-muted">—</li>
        ) : (
          (data || []).map((c) => {
            const classes = Array.isArray(c.nice_classes)
              ? (c.nice_classes as unknown[]).map(String).slice(0, 8).join(", ")
              : "";
            const risk =
              c.report &&
              typeof c.report === "object" &&
              "riskLevel" in (c.report as object)
                ? String((c.report as { riskLevel?: string }).riskLevel)
                : "";
            return (
              <li key={c.id} className="py-3">
                <p className="font-medium text-ink">
                  {c.query}
                  {c.activity_raw ? ` · ${c.activity_raw}` : ""}
                </p>
                <p className="text-ink-muted">
                  {[
                    c.source,
                    c.locale,
                    risk,
                    classes ? `MKTU ${classes}` : null,
                    c.user_id ? `${c.user_id.slice(0, 8)}…` : null,
                    new Date(c.created_at).toLocaleString(),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </AppShell>
  );
}
